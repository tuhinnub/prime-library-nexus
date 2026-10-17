import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  bookId?: string;
  src: string | null;
  title: string;
  className?: string;
  /** Enables a view-transition shared element between list and details. */
  shared?: boolean;
  eager?: boolean;
}

export function BookCover({ bookId, src, title, className, shared, eager }: Props) {
  const [failed, setFailed] = useState(false);
  const style = shared && bookId ? { viewTransitionName: `book-${bookId}` } : undefined;
  const url = src ? (src.includes("openlibrary") ? `${src}?default=false` : src) : null;

  if (!url || failed) {
    return (
      <div
        style={style}
        className={cn(
          "book-cover flex aspect-[2/3] items-end bg-gradient-to-br from-primary to-bluegray p-3",
          className,
        )}
        role="img"
        aria-label={`${title} cover`}
      >
        <span className="line-clamp-3 text-sm font-extrabold leading-tight text-primary-foreground">{title}</span>
      </div>
    );
  }
  return (
    <img
      style={style}
      src={url}
      alt={`${title} cover`}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={cn("book-cover aspect-[2/3] w-full", className)}
    />
  );
}
