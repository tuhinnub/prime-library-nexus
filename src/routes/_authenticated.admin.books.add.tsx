import { createFileRoute, redirect } from '@tanstack/react-router';
import { BookEditor } from '@/components/admin/ManagementViews';
import { managementHead } from '@/lib/management';
export const Route = createFileRoute('/_authenticated/admin/books/add')({
  beforeLoad: ({ context }) => { if (!context.access.admin) throw redirect({ to: '/admin', replace: true }); },
  head: () => managementHead('Add book','Add a library book.'),
  component: View,
});
function View() { return <BookEditor/>; }
