import { describe, it, expect } from 'vitest';
import postgres from 'postgres';

describe.skipIf(!process.env.SUPABASE_DB_URL)('Management database authorization', () => {
  it('rejects non-staff RPC requests and denies direct protected writes', async () => {
    const url = process.env.SUPABASE_DB_URL;
    if (!url) throw new Error('Test connection unavailable');
    const sql = postgres(url, { max: 1, prepare: false });
    const rollback = new Error('Rollback test context');
    let deniedCount = 0;
    try {
      await sql.begin(async tx => {
        // A UUID with no role is a concrete non-staff identity; no account data changes.
        await tx`select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true)`;
        await tx`set local role authenticated`;
        for (const statement of [
          'select public.management_access()',
          'select public.management_members()',
          `select public.management_save_book('{"title":"Unauthorized","isbn":"DENIED"}')`,
          'select public.management_update_settings(14,0,3)',
          `select public.super_admin_set_role('00000000-0000-0000-0000-000000000001','super_admin')`,
          `select public.management_save_copy('00000000-0000-0000-0000-000000000001','DENIED','A1')`,
        ]) {
          let failure: unknown;
          try { await tx.savepoint(async sp => { await sp.unsafe(statement); }); }
          catch (e) { failure = e; }
          expect(String(failure)).toMatch(/Not authorized|Admin access required|Super admin access required/);
          deniedCount++;
        }
        for (const table of ['user_roles','book_copies','borrow_records','reservations','fines','library_settings']) {
          const [result] = await tx`select has_table_privilege('authenticated',${`public.${table}`},'UPDATE') as allowed`;
          expect(result.allowed).toBe(false);
        }
        const [access] = await tx`select public.is_staff('00000000-0000-0000-0000-000000000001') as staff, public.is_admin('00000000-0000-0000-0000-000000000001') as admin`;
        expect(access).toEqual({staff:false,admin:false});
        throw rollback;
      });
    } catch (e) { if (e !== rollback) throw e; }
    finally { await sql.end(); }
    expect(deniedCount).toBe(6);
  });
});
