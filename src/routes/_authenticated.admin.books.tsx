import { createFileRoute, redirect } from '@tanstack/react-router';
import { Catalogue } from '@/components/admin/ManagementViews';
import { managementHead } from '@/lib/management';
export const Route = createFileRoute('/_authenticated/admin/books')({
  beforeLoad: ({ context }) => { if (!context.access.admin) throw redirect({ to: '/admin', replace: true }); },
  head: () => managementHead('Catalogue','Manage the library catalogue.'),
  component: View,
});
function View() { return <Catalogue/>; }
