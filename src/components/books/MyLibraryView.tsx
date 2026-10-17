import { Link } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/layout/AppLayout";
import { BookCard, BookGrid } from "./BookCard";
import { DueBadge, ReservationBadge } from "./badges";
import { BorrowedBookCard, ReservationCard } from "./cards";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { useBorrows, useFavorites, useReservations } from "@/hooks/use-library";
import { dueState, formatDate } from "@/lib/due";
import { cn } from "@/lib/utils";

export type LibraryTab = "all" | "borrowed" | "reserved" | "history" | "favorites";

const tabs: { k: LibraryTab; label: string; to: "/my-library" | "/my-library/borrowed" | "/my-library/reservations" | "/my-library/history" | "/favorites" }[] = [
  { k: "all", label: "All", to: "/my-library" },
  { k: "borrowed", label: "Borrowed", to: "/my-library/borrowed" },
  { k: "reserved", label: "Reserved", to: "/my-library/reservations" },
  { k: "history", label: "History", to: "/my-library/history" },
  { k: "favorites", label: "Favorites", to: "/favorites" },
];

const ACTIVE_RES = ["pending", "approved", "ready_for_pickup"];

export function MyLibraryView({ tab }: { tab: LibraryTab }) {
  const borrows = useBorrows();
  const res = useReservations();
  const favs = useFavorites();
  const loading = borrows.isLoading || res.isLoading || favs.isLoading;
  const error = borrows.error || res.error || favs.error;

  const active = (borrows.data ?? []).filter((b) => !b.returnedAt);
  const history = (borrows.data ?? []).filter((b) => b.returnedAt);
  const activeRes = (res.data ?? []).filter((r) => ACTIVE_RES.includes(r.status));
  const pastRes = (res.data ?? []).filter((r) => !ACTIVE_RES.includes(r.status));
  const total = active.length + activeRes.length + (favs.data?.length ?? 0);

  return (
    <Page>
      <PageTitle title="My Library" subtitle={`${total} ${total === 1 ? "Book" : "Books"}`} />
      <nav aria-label="Library sections" className="no-scrollbar -mx-5 mb-7 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <Link
            key={t.k}
            to={t.to}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all",
              t.k === tab ? "bg-ink text-primary-foreground" : "bg-card text-muted-foreground shadow-soft hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {loading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : tab === "all" ? (
        total === 0 ? (
          <EmptyState
            title="Your library is empty"
            description="Reserve or favorite books and they'll be gathered here."
            action={
              <Button asChild variant="hero" size="pill">
                <Link to="/explore">Explore books</Link>
              </Button>
            }
          />
        ) : (
          <BookGrid>
            {active.map((b) => (
              <BookCard key={`b${b.id}`} book={b.book} meta={<div className="flex flex-wrap items-center gap-1"><DueBadge state={dueState(b.dueAt, b.returnedAt)} /><span className="text-[11px] text-muted-foreground">Due {formatDate(b.dueAt)}</span></div>} />
            ))}
            {activeRes.map((r) => (
              <BookCard key={`r${r.id}`} book={r.book} meta={<ReservationBadge status={r.status} />} />
            ))}
            {(favs.data ?? []).map((b) => (
              <BookCard key={`f${b.id}`} book={b} />
            ))}
          </BookGrid>
        )
      ) : tab === "borrowed" ? (
        active.length ? (
          <div className="grid gap-3 lg:grid-cols-2">{active.map((b) => <BorrowedBookCard key={b.id} b={b} />)}</div>
        ) : (
          <EmptyState title="No borrowed books" description="Books are checked out by a librarian at the desk; they'll show up here with due dates." />
        )
      ) : tab === "reserved" ? (
        res.data?.length ? (
          <div className="space-y-8">
            {activeRes.length > 0 && <div className="grid gap-3 lg:grid-cols-2">{activeRes.map((r) => <ReservationCard key={r.id} r={r} />)}</div>}
            {pastRes.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-bold text-muted-foreground">Past reservations</h2>
                <div className="grid gap-3 lg:grid-cols-2">{pastRes.map((r) => <ReservationCard key={r.id} r={r} />)}</div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState title="No reservations" description="Open a book and tap Reserve when copies are available." />
        )
      ) : tab === "history" ? (
        history.length ? (
          <div className="grid gap-3 lg:grid-cols-2">{history.map((b) => <BorrowedBookCard key={b.id} b={b} />)}</div>
        ) : (
          <EmptyState title="No borrowing history yet" />
        )
      ) : favs.data?.length ? (
        <BookGrid>{favs.data.map((b) => <BookCard key={b.id} book={b} />)}</BookGrid>
      ) : (
        <EmptyState title="No favorites yet" description="Tap the heart on any book to save it here." />
      )}
    </Page>
  );
}
