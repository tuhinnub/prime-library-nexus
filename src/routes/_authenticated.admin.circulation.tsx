import { createFileRoute } from '@tanstack/react-router';
import { CirculationDesk } from '@/components/admin/CirculationDesk';
import { ManagementTitle } from '@/components/admin/ManagementViews';
import { managementHead } from '@/lib/management';
export const Route = createFileRoute('/_authenticated/admin/circulation')({head:()=>managementHead('Circulation','Check out books, process returns and manage reservations.'),component:View});
function View(){ const {access}=Route.useRouteContext();return <><ManagementTitle title="Circulation desk"/><CirculationDesk canManageRules={access.admin}/></>; }
