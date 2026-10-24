import { createFileRoute, Outlet, Link, redirect } from '@tanstack/react-router';
import { library } from '@/services';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { canEnterManagement } from '@/lib/management';
export const Route = createFileRoute('/_authenticated/admin')({
  ssr: false,
  beforeLoad: async () => {
    try { const access = await library.managementAccess(); if (!canEnterManagement(access)) throw new Error('Access denied'); return { access }; }
    catch { throw redirect({ to: '/profile', replace: true }); }
  },
  component: AdminLayout,
});
function AdminLayout() {
  const { access } = Route.useRouteContext(); const { signOut } = useAuth();
  const links = [
    { to: '/admin', label: 'Overview', show: true },
    { to: '/admin/books', label: 'Catalogue', show: access.admin },
    { to: '/admin/categories', label: 'Categories', show: access.admin },
    { to: '/admin/authors', label: 'Authors', show: access.admin },
    { to: '/admin/users', label: 'Members', show: access.admin },
    { to: '/admin/circulation', label: 'Circulation', show: true },
    { to: '/admin/super-admin', label: 'Super admin', show: access.superAdmin },
  ] as const;
  return <div className="min-h-screen bg-background"><header className="border-b bg-card"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5"><div className="flex items-center gap-3"><Logo/><span className="flex items-center gap-1 rounded-full bg-lime px-3 py-1 text-xs font-bold"><ShieldCheck className="size-3"/>{access.superAdmin ? 'Super admin' : access.admin ? 'Admin' : 'Librarian'}</span></div><div className="flex items-center gap-2"><Button variant="ghost" size="sm" asChild><Link to="/dashboard"><ArrowLeft/>Back to library</Link></Button><Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut}><LogOut/></Button></div></div><nav aria-label="Administration" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3">{links.filter(l=>l.show).map(l=><Link key={l.to} to={l.to} activeOptions={{exact:l.to === '/admin'}} className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold" activeProps={{className:'bg-primary text-primary-foreground'}} inactiveProps={{className:'text-muted-foreground hover:bg-muted'}}>{l.label}</Link>)}</nav></header><main className="mx-auto max-w-6xl px-5 py-10"><Outlet/></main></div>;
}
