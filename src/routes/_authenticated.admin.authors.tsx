import { createFileRoute, redirect } from '@tanstack/react-router';
import { Taxonomy } from '@/components/admin/ManagementViews';
import { managementHead } from '@/lib/management';
export const Route = createFileRoute('/_authenticated/admin/authors')({
  beforeLoad: ({ context }) => { if (!context.access.admin) throw redirect({ to: '/admin', replace: true }); },
  head: () => managementHead('Authors','Manage catalogue authors.'),
  component: View,
});
function View() { return <Taxonomy kind="authors"/>; }
