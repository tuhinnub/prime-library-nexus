import { describe, it, expect } from 'vitest';
import postgres from 'postgres';

// Every role fixture and write stays inside a transaction that always rolls back.
// Run only in an environment with a privileged test connection.
describe.skipIf(!process.env.SUPABASE_DB_URL)('Management database authorization', () => {
  it('enforces roles, direct-write denial and self/last-owner protection', async () => {
    const url = process.env.SUPABASE_DB_URL;
    if (!url) throw new Error('Test connection unavailable');
    const sql = postgres(url, { max: 1, prepare: false });
    const rollback = new Error('Rollback security fixtures');
    let checks = 0;
    try {
      await sql.begin(async tx => {
        await tx`select pg_advisory_xact_lock(420197)`;
        const [member] = await tx`select id from public.profiles limit 1`;
        if (!member) throw new Error('A registered account is needed for authorization tests');
        await tx`select set_config('request.jwt.claim.sub', ${member.id}, true)`;
        const denied = async (statement: string, message?: string) => {
          let failure: unknown;
          try { await tx.savepoint(async sp => { await sp.unsafe(statement); }); }
          catch (e) { failure = e; }
          expect(failure).toBeDefined();
          if (message) expect(String(failure)).toContain(message);
          checks++;
        };
        await tx`delete from public.user_roles where user_id=${member.id}`;
        await tx`insert into public.user_roles(user_id,role) values(${member.id},'student')`;
        await tx`set local role authenticated`;
        await denied('select public.management_access()', 'Not authorized');
        await denied('select public.management_members()', 'Not authorized');
        await denied("select public.management_save_book('{\"title\":\"Unauthorized\",\"isbn\":\"DENIED\"}')", 'Admin access required');
        await denied('select public.management_update_settings(14,0,3)', 'Admin access required');
        await denied(`select public.super_admin_set_role('${member.id}','super_admin')`, 'Super admin access required');
        await denied("insert into public.books(title,isbn) values('Unauthorized','DENIED')");
        await denied("update public.book_copies set status='available'");
        await denied("update public.borrow_records set status='returned'");
        await denied("update public.reservations set status='completed'");
        await denied("update public.fines set status='paid'");
        await denied(`insert into public.user_roles(user_id,role) values('${member.id}','admin')`);
        expect((await tx`select * from public.admin_audit_log`).length).toBe(0);
        checks++;
        await tx`reset role`;
        await tx`update public.user_roles set role='librarian' where user_id=${member.id}`;
        await tx`set local role authenticated`;
        const [staff] = await tx`select public.management_access() as access`;
        expect(staff.access).toEqual({staff:true,admin:false,superAdmin:false}); checks++;
        await denied('select public.management_members()', 'Not authorized');
        await tx`reset role`;
        await tx`update public.user_roles set role='admin' where user_id=${member.id}`;
        await tx`set local role authenticated`;
        const [admin] = await tx`select public.management_access() as access`;
        expect(admin.access).toEqual({staff:true,admin:true,superAdmin:false}); checks++;
        await denied(`select public.super_admin_set_role('${member.id}','super_admin')`, 'Super admin access required');
        await tx`reset role`;
        await tx`update public.user_roles set role='super_admin' where user_id=${member.id}`;
        await tx`set local role authenticated`;
        const [owner] = await tx`select public.management_access() as access`;
        expect(owner.access).toEqual({staff:true,admin:true,superAdmin:true}); checks++;
        await denied(`select public.super_admin_set_role('${member.id}','student')`, 'You cannot change your own role');
        throw rollback;
      });
    } catch (e) { if (e !== rollback) throw e; }
    finally { await sql.end(); }
    expect(checks).toBe(18);
  });
});