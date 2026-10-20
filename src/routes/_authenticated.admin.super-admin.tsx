import { createFileRoute, redirect } from '@tanstack/react-router';
import { Members, AuditHistory } from '@/components/admin/ManagementViews';
import { managementHead } from '@/lib/management';
export const Route = createFileRoute('/_authenticated/admin/super-admin')({
  beforeLoad: ({ context }) => { if (!context.access.superAdmin) throw redirect({ to: '/admin', replace: true }); },
  head: () => managementHead('Super administration','Manage administrator access and review changes.'),
  component: View,
});
function View() { return <><Members owner/><AuditHistory/></>; }
