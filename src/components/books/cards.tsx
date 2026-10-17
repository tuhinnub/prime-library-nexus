import { Link } from "@tanstack/react-router";
import { Bell, CalendarClock, Receipt } from "lucide-react";
import type { AppNotification, BorrowRecord, Fine, Reservation } from "@/types/library";
import { BookCover } from "./BookCover";
import { DueBadge, ReservationBadge } from "./badges";
import { daysUntil, dueState, formatDate } from "@/lib/due";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useCancelReservation, useSettings } from "@/hooks/use-library";
import { cn } from "@/lib/utils";

const row = "flex gap-4 rounded-3xl bg-card p-3 pr-4 shadow-soft";

export function ReservationCard({ r }: { r: Reservation }) {
  const cancel = useCancelReservation();
  const active = ["pending", "approved", "ready_for_pickup"].includes(r.status);
  return (
    <article className={row}>
      <Link to="/books/$id" params={{ id: r.book.id }} className="w-16 shrink-0">
        <BookCover src={r.book.coverUrl} title={r.book.title} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-bold">{r.book.title}</h3>
            <ReservationBadge status={r.status} />
          </div>
          <p className="text-xs text-muted-foreground">{r.book.authors.join(", ")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Reserved {formatDate(r.reservedAt)}
            {active && r.expiresAt ? ` · hold until ${formatDate(r.expiresAt)}` : ""}
          </p>
        </div>
        {active && (
          <ConfirmDialog
            title="Cancel reservation?"
            description={`Your hold on "${r.book.title}" will be released for other readers.`}
            confirmLabel="Cancel reservation"
            onConfirm={() => cancel.mutate(r.id)}
            trigger={
              <Button variant="link" size="sm" className="h-auto self-start p-0 text-xs text-destructive">
                Cancel reservation
              </Button>
            }
          />
        )}
      </div>
    </article>
  );
}

export function BorrowedBookCard({ b }: { b: BorrowRecord }) {
  const state = dueState(b.dueAt, b.returnedAt);
  const d = daysUntil(b.dueAt);
  return (
    <article className={cn(row, state === "overdue" && "ring-2 ring-destructive/30")}>
      <Link to="/books/$id" params={{ id: b.book.id }} className="w-16 shrink-0">
        <BookCover src={b.book.coverUrl} title={b.book.title} />
      </Link>
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-bold">{b.book.title}</h3>
          <DueBadge state={state} />
        </div>
        <p className="text-xs text-muted-foreground">Copy {b.barcode}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Borrowed</p>
            <p className="font-semibold">{formatDate(b.borrowedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{b.returnedAt ? "Returned" : "Due"}</p>
            <p className="font-semibold">{formatDate(b.returnedAt ?? b.dueAt)}</p>
          </div>
        </div>
        {!b.returnedAt && (
          <p className={cn("mt-2 inline-flex items-center gap-1 text-xs font-bold", d < 0 ? "text-destructive" : "text-primary")}>
            <CalendarClock className="size-3.5" />
            {d < 0 ? `${-d} day${d === -1 ? "" : "s"} overdue` : d === 0 ? "Due today" : `${d} day${d === 1 ? "" : "s"} left`}
          </p>
        )}
      </div>
    </article>
  );
}

export function FineCard({ f }: { f: Fine }) {
  const { data: s } = useSettings();
  const money = new Intl.NumberFormat(undefined, { style: "currency", currency: s?.currency ?? "BDT" }).format(f.amount);
  return (
    <article className="rounded-3xl bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
            <Receipt className="size-4" />
          </span>
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-sm font-bold">{f.borrow.bookTitle}</h3>
            <p className="text-xs text-muted-foreground">{f.overdueDays} overdue days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold">{money}</p>
          <span className={cn("text-[11px] font-bold uppercase", f.status === "unpaid" ? "text-destructive" : "text-muted-foreground")}>{f.status}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-3 text-xs">
        <div>
          <p className="text-muted-foreground">Due date</p>
          <p className="font-semibold">{formatDate(f.borrow.dueAt)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Return date</p>
          <p className="font-semibold">{formatDate(f.borrow.returnedAt)}</p>
        </div>
      </div>
    </article>
  );
}

export function NotificationCard({ n, onRead }: { n: AppNotification; onRead: () => void }) {
  const unread = !n.readAt;
  return (
    <article className={cn("flex gap-3 rounded-3xl bg-card p-4 shadow-soft transition-colors", unread && "ring-1 ring-primary/20")}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", unread ? "bg-lime" : "bg-muted text-muted-foreground")}>
        <Bell className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold">{n.title}</h3>
          <time className="shrink-0 text-[11px] text-muted-foreground">{formatDate(n.createdAt)}</time>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
        <div className="mt-2 flex gap-4 text-xs font-semibold">
          {n.link && (
            <a href={n.link} className="text-primary">
              Open
            </a>
          )}
          {unread && (
            <button onClick={onRead} className="text-muted-foreground hover:text-foreground">
              Mark as read
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
