import { createFileRoute, redirect } from '@tanstack/react-router';
import { Taxonomy } from '@/components/admin/ManagementViews';
import { managementHead } from '@/lib/management';
export const Route = createFileRoute('/_authenticated/admin/categories')({
  beforeLoad: ({ context }) => { if (!context.access.admin) throw redirect({ to: '/admin', replace: true }); },
  head: () => managementHead('Categories','Manage book categories.'),
  component: View,
});
function View() { return <Taxonomy kind="categories"/>; }
