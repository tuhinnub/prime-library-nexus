import { cn } from "@/lib/utils";
import type { DueState, ReservationStatus } from "@/types/library";

const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold";

export function AvailabilityBadge({ available, total }: { available: number; total: number }) {
  const ok = available > 0;
  return (
    <span className={cn(base, ok ? "bg-lime text-lime-foreground" : "bg-muted text-muted-foreground")}>
      <span className={cn("size-1.5 rounded-full", ok ? "bg-primary" : "bg-muted-foreground/60")} />
      {ok ? `${available} of ${total} available` : total ? "All copies out" : "No copies"}
    </span>
  );
}

const resLabel: Record<ReservationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  ready_for_pickup: "Ready for pickup",
  cancelled: "Cancelled",
  completed: "Completed",
  expired: "Expired",
};

export function ReservationBadge({ status }: { status: ReservationStatus }) {
  const tone =
    status === "ready_for_pickup"
      ? "bg-lime text-lime-foreground"
      : status === "approved"
        ? "bg-primary text-primary-foreground"
        : status === "pending"
          ? "bg-primary-soft text-primary"
          : "bg-muted text-muted-foreground";
  return <span className={cn(base, tone)}>{resLabel[status]}</span>;
}

const dueLabel: Record<DueState, string> = {
  active: "Active",
  due_soon: "Due soon",
  overdue: "Overdue",
  returned: "Returned",
};

export function DueBadge({ state }: { state: DueState }) {
  const tone =
    state === "overdue"
      ? "bg-destructive text-destructive-foreground"
      : state === "due_soon"
        ? "bg-lime text-lime-foreground"
        : state === "active"
          ? "bg-primary-soft text-primary"
          : "bg-muted text-muted-foreground";
  return <span className={cn(base, tone)}>{dueLabel[state]}</span>;
}
