import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Heart, Star } from "lucide-react";
import { Page } from "@/components/layout/AppLayout";
import { BookCover } from "@/components/books/BookCover";
import { AvailabilityBadge, ReservationBadge } from "@/components/books/badges";
import { ErrorState, LoadingSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { useBook, useFavoriteIds, useReservations, useReserveBook, useToggleFavorite } from "@/hooks/use-library";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/books/$id")({
  head: () => ({
    meta: [
      { title: "Book details — Smart Library" },
      { name: "description", content: "Availability, details and reservation for this book." },
      { property: "og:title", content: "Book details — Smart Library" },
      { property: "og:description", content: "Availability, details and reservation for this book." },
      { property: "og:type", content: "book" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookDetails,
});

function BookDetails() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { data: book, isLoading, error, refetch } = useBook(id);
  const { data: favIds = [] } = useFavoriteIds();
  const { data: reservations = [] } = useReservations();
  const toggle = useToggleFavorite();
  const reserve = useReserveBook();

  if (isLoading) return <LoadingSkeleton count={1} variant="list" />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!book)
    return (
      <ErrorState message="This book could not be found." />
    );

  const fav = favIds.includes(book.id);
  const active = reservations.find((r) => r.book.id === book.id && ["pending", "approved", "ready_for_pickup"].includes(r.status));
  const canReserve = book.availableCopies > 0 && !active;

  const details: [string, string | number | null][] = [
    ["ISBN", book.isbn],
    ["Publisher", book.publisher],
    ["Category", book.category?.name ?? null],
    ["Department", book.department],
    ["Language", book.language],
    ["Published", book.publicationYear],
    ["Pages", book.pages],
    ["Total copies", book.totalCopies],
    ["Available", book.availableCopies],
  ];

  return (
    <Page>
      <button onClick={() => router.history.back()} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back
      </button>
      <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_1fr] md:gap-14">
        <div className="relative mx-auto w-52 md:w-full">
          <div className="pointer-events-none absolute -inset-8 -z-0 rounded-full aura-bg opacity-60 blur-3xl" />
          <div className="relative">
            <BookCover bookId={book.id} src={book.coverUrl} title={book.title} shared eager className="shadow-float" />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
          {book.category && (
            <Link to="/explore" search={{ category: book.category.slug }} className="text-xs font-bold uppercase tracking-widest text-primary">
              {book.category.name}
            </Link>
          )}
          <h1 className="title-xl mt-2">{book.title}</h1>
          <p className="mt-2 text-base text-muted-foreground">by {book.authors.join(", ") || "Unknown author"}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-sm font-bold">
              <Star className="size-4 fill-lime text-ink" /> {book.rating.toFixed(1)}
            </span>
            <AvailabilityBadge available={book.availableCopies} total={book.totalCopies} />
            {active && <ReservationBadge status={active.status} />}
          </div>

          {book.description && <p className="mt-6 max-w-prose leading-relaxed text-muted-foreground">{book.description}</p>}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="hero" size="xl" className="sm:w-auto" disabled={!canReserve || reserve.isPending} onClick={() => reserve.mutate(book.id)}>
              {active ? "Already reserved" : book.availableCopies > 0 ? (reserve.isPending ? "Reserving…" : "Reserve Book") : "Unavailable to reserve"}
            </Button>
            <Button variant="soft" size="xl" className="sm:w-auto" aria-pressed={fav} onClick={() => toggle.mutate({ bookId: book.id, fav })}>
              <Heart className={cn("!size-5", fav && "fill-primary text-primary")} /> {fav ? "In favorites" : "Add to Favorites"}
            </Button>
          </div>
          {!canReserve && !active && (
            <p className="mt-3 text-xs text-muted-foreground">All copies are currently on loan, reserved or under maintenance.</p>
          )}

          <dl id="availability" className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-border shadow-soft sm:grid-cols-3">
            {details.map(([k, v]) => (
              <div key={k} className="bg-card p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-sm font-bold">{v ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </Page>
  );
}
