import { describe, it, expect } from 'vitest';
import postgres from 'postgres';

describe.skipIf(!process.env.SUPABASE_DB_URL)('Management database security configuration', () => {
  it('denies ordinary users cover uploads and book mutations', async () => {
    const url = process.env.SUPABASE_DB_URL;
    if (!url) throw new Error('Test connection unavailable');
    const sql = postgres(url, { max: 1, prepare: false });
    try {
      const uid = '00000000-0000-0000-0000-000000000099';
      await expect(sql.begin(async tx => {
        await tx`set local role authenticated`;
        await tx`select set_config('request.jwt.claim.sub',${uid},true)`;
        await tx`insert into storage.objects(bucket_id,name) values('book-covers',${`${uid}/denied.png`})`;
      })).rejects.toThrow(/row-level security/);
      await expect(sql.begin(async tx => {
        await tx`set local role authenticated`;
        await tx`select set_config('request.jwt.claim.sub',${uid},true)`;
        await tx`select public.management_save_book(${JSON.stringify({title:'Denied',isbn:'DENIED'})}::jsonb)`;
      })).rejects.toThrow(/Admin access required/);
    } finally { await sql.end(); }
  });
  it('allows super-admin uploads only under their own folder', async () => {
    const url = process.env.SUPABASE_DB_URL;
    if (!url) throw new Error('Test connection unavailable');
    const sql = postgres(url, { max: 1, prepare: false });
    try {
      const [owner] = await sql`select user_id from public.user_roles where role='super_admin' limit 1`;
      if (!owner) throw new Error('Super admin missing');
      await expect(sql.begin(async tx => {
        await tx`set local role authenticated`;
        await tx`select set_config('request.jwt.claim.sub',${owner.user_id},true)`;
        const rows = await tx`insert into storage.objects(bucket_id,name) values('book-covers',${`${owner.user_id}/permission-test.png`}) returning id`;
        expect(rows).toHaveLength(1);
        throw new Error('Rollback verified upload');
      })).rejects.toThrow('Rollback verified upload');
      await expect(sql.begin(async tx => {
        await tx`set local role authenticated`;
        await tx`select set_config('request.jwt.claim.sub',${owner.user_id},true)`;
        await tx`insert into storage.objects(bucket_id,name) values('book-covers','someone-else/denied.png')`;
      })).rejects.toThrow(/row-level security/);
    } finally { await sql.end(); }
  });
  it('retains protected writes and backend role-change safeguards', async () => {
    const url = process.env.SUPABASE_DB_URL;
    if (!url) throw new Error('Test connection unavailable');
    const sql = postgres(url, { max: 1, prepare: false });
    try {
      for (const table of ['user_roles','book_copies','borrow_records','reservations','fines','library_settings']) {
        const [result] = await sql`select has_table_privilege('authenticated',${`public.${table}`},'UPDATE') as allowed`;
        expect(result.allowed).toBe(false);
      }
      const [role] = await sql`select pg_get_functiondef('public.super_admin_set_role(uuid,public.app_role)'::regprocedure) as definition`;
      expect(role.definition).toContain("has_role(auth.uid(),'super_admin')");
      expect(role.definition).toContain('auth.uid()=_user_id');
      expect(role.definition).toContain('The last super admin cannot be removed');
      expect(role.definition).toContain('pg_advisory_xact_lock');
      const [audit] = await sql`select relrowsecurity as enabled from pg_class where oid='public.admin_audit_log'::regclass`;
      expect(audit.enabled).toBe(true);
      const [grant] = await sql`select has_function_privilege('anon','public.super_admin_set_role(uuid,public.app_role)','EXECUTE') as allowed`;
      expect(grant.allowed).toBe(false);
    } finally { await sql.end(); }
  });
});
