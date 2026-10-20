import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { library } from '@/services';
import { managementHead } from '@/lib/management';
import { ManagementTitle } from '@/components/admin/ManagementViews';
import { ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
export const Route = createFileRoute('/_authenticated/admin/')({ head:()=>managementHead('Administration','Live library management overview.'), component:Overview });
function Overview() {
  const metrics=useQuery({queryKey:['admin-metrics'],queryFn:()=>library.adminMetrics()}); const m=metrics.data;
  return <><ManagementTitle title="Library overview" action={<Button asChild><Link to="/admin/circulation">Open circulation<ArrowUpRight/></Link></Button>}/>{metrics.error?<ErrorState message={metrics.error.message}/>:!m?<p>Loading overview…</p>:<div className="grid grid-cols-2 gap-x-8 gap-y-10 border-y py-8 md:grid-cols-3">{[['Total books',m.total_books],['Available copies',m.available_copies],['Borrowed',m.borrowed],['Overdue',m.overdue],['Members',m.users],['Pending reservations',m.pending_reservations]].map(([k,v])=><div key={k}><p className="text-sm text-muted-foreground">{k}</p><p className="mt-3 text-4xl font-extrabold text-primary">{v}</p></div>)}</div>}</>;
}
