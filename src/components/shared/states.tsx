import type { ReactNode } from "react";
import { BookOpen, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton({ count = 6, variant = "grid" }: { count?: number; variant?: "grid" | "list" }) {
  if (variant === "list")
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] rounded-lg" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-lime">
        <BookOpen className="size-6" />
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-3xl bg-card px-6 py-12 text-center shadow-soft">
      <TriangleAlert className="mb-3 size-7 text-destructive" />
      <h3 className="font-bold">Something went wrong</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message ?? "We couldn't load this right now."}</p>
      {onRetry && (
        <Button variant="soft" size="pill" className="mt-5" onClick={onRetry}>
          <RotateCw /> Try again
        </Button>
      )}
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">{title}</h2>
      {action}
    </div>
  );
}
