import { cn } from "@/lib/utils";

export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative grid size-9 place-items-center rounded-full bg-ink">
        <span className="h-4 w-1 -rotate-12 rounded-sm bg-lime" />
        <span className="ml-0.5 h-4 w-1 rotate-6 rounded-sm bg-primary-foreground" />
      </span>
      {!compact && <span className="text-base font-extrabold tracking-tight">Smart Library</span>}
    </span>
  );
}
