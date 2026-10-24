import { describe, it, expect } from 'vitest';
import postgres from 'postgres';

describe.skipIf(!process.env.SUPABASE_DB_URL)('Management database security configuration', () => {
  it('requires database admin permission for cover uploads', async () => {
    const url = process.env.SUPABASE_DB_URL;
    if (!url) throw new Error('Test connection unavailable');
    const sql = postgres(url, { max: 1, prepare: false });
    try {
      const policies = await sql`select with_check, roles from pg_policies where schemaname='storage' and tablename='objects' and cmd in ('INSERT','ALL') and with_check like '%book-covers%'`;
      expect(policies).toHaveLength(1);
      expect(policies[0].with_check).toContain('is_admin(auth.uid())');
      expect(policies[0].roles).toEqual(['authenticated']);
      const [roles] = await sql`select pg_get_functiondef('public.is_admin(uuid)'::regprocedure) as definition`;
      expect(roles.definition).toContain('super_admin');
      expect(roles.definition).toContain('admin');
      expect(roles.definition).not.toContain('student');
    } finally { await sql.end(); }
  });
  it('restricts upload paths and allows readers to view covers', async () => {
    const url = process.env.SUPABASE_DB_URL;
    if (!url) throw new Error('Test connection unavailable');
    const sql = postgres(url, { max: 1, prepare: false });
    try {
      const [upload] = await sql`select with_check from pg_policies where schemaname='storage' and tablename='objects' and policyname='Admins upload book covers'`;
      expect(upload.with_check).toContain('foldername(name)');
      expect(upload.with_check).toContain('(auth.uid())::text');
      const [read] = await sql`select qual,roles from pg_policies where schemaname='storage' and tablename='objects' and policyname='Readers view book covers'`;
      expect(read.qual).toContain('book-covers');
      expect(read.roles).toEqual(['authenticated']);
      const [save] = await sql`select pg_get_functiondef('public.management_save_book(jsonb)'::regprocedure) as definition`;
      expect(save.definition).toContain('public.is_admin(auth.uid())');
      expect(save.definition).toContain('cover_url=');
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
