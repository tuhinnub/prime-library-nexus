import { createFileRoute, redirect } from '@tanstack/react-router';
import { BookEditor } from '@/components/admin/ManagementViews';
import { managementHead } from '@/lib/management';
export const Route = createFileRoute('/_authenticated/admin/books/$id')({
  beforeLoad: ({ context }) => { if (!context.access.admin) throw redirect({ to: '/admin', replace: true }); },
  head: () => managementHead('Edit book','Edit a book and manage physical copies.'),
  component: View,
});
function View() { return <BookEditor id={Route.useParams().id}/>; }
