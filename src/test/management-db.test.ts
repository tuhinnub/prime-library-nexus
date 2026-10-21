import { describe, it, expect } from 'vitest';
import postgres from 'postgres';

describe.skipIf(!process.env.SUPABASE_DB_URL)('Management database security configuration', () => {
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
