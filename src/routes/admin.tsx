import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRoles } from "@/hooks/use-library";
import { library } from "@/services";
import { Logo } from "@/components/shared/Logo";
import { ErrorState, LoadingSkeleton } from "@/components/shared/states";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Smart Library" },
      { name: "description", content: "Library management overview for librarians and administrators." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Smart Library" },
      { property: "og:description", content: "Library management overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { user, loading } = useAuth();
  const roles = useRoles();
  const isStaff = (roles.data ?? []).some((r) => r === "admin" || r === "librarian");
  const metrics = useQuery({ queryKey: ["admin-metrics"], queryFn: () => library.adminMetrics(), enabled: isStaff });

  if (loading || roles.isLoading) return <div className="p-10"><LoadingSkeleton variant="list" count={2} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStaff)
    return (
      <div className="mx-auto max-w-md p-10">
        <ErrorState message="This area is only for librarians and administrators." />
        <Link to="/dashboard" className="mt-4 block text-center text-sm font-semibold text-primary">Back to home</Link>
      </div>
    );

  const m = metrics.data;
  const cards = m
    ? [
        ["Total books", m.total_books],
        ["Available copies", m.available_copies],
        ["Borrowed", m.borrowed],
        ["Overdue", m.overdue],
        ["Registered users", m.users],
        ["Pending reservations", m.pending_reservations],
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3"><Logo /><span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase">Admin</span></div>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="size-4" /> User app</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="title-lg mb-6">Library overview</h1>
        {metrics.error ? (
          <ErrorState message={metrics.error.message} />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {cards.map(([k, v]) => (
              <div key={k} className="rounded-3xl bg-card p-6 shadow-soft">
                <p className="text-xs font-semibold text-muted-foreground">{k}</p>
                <p className="mt-2 text-4xl font-extrabold tracking-tight">{v}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-8 text-sm text-muted-foreground">Book, user, borrowing and fine management screens arrive in the admin phase.</p>
      </main>
    </div>
  );
}
