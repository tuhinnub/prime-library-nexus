import type { DueState } from "@/types/library";

const DAY = 86_400_000;
export const DUE_SOON_DAYS = 3;

/** Whole days from `now` until `dueAt` (negative when overdue). */
export function daysUntil(dueAt: string | Date, now: Date = new Date()): number {
  const due = new Date(dueAt).getTime();
  return Math.ceil((due - now.getTime()) / DAY);
}

export function dueState(
  dueAt: string,
  returnedAt: string | null,
  now: Date = new Date(),
): DueState {
  if (returnedAt) return "returned";
  const d = daysUntil(dueAt, now);
  if (d < 0) return "overdue";
  if (d <= DUE_SOON_DAYS) return "due_soon";
  return "active";
}

export function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
