import { createFileRoute, redirect } from '@tanstack/react-router';
import { Members } from '@/components/admin/ManagementViews';
import { managementHead } from '@/lib/management';
export const Route = createFileRoute('/_authenticated/admin/users')({
  beforeLoad: ({ context }) => { if (!context.access.admin) throw redirect({ to: '/admin', replace: true }); },
  head: () => managementHead('Members','Library member directory.'),
  component: View,
});
function View() { return <Members/>; }
