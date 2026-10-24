import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { library } from '@/services';

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
  const [failedSrc, setFailedSrc] = useState<string>();
  const privateCover = src?.startsWith('storage://book-covers/') === true;
  const resolved = useQuery({ queryKey: ['book-cover', src], queryFn: () => library.resolveBookCover(src ?? ''), enabled: privateCover, staleTime: 30 * 60 * 1000, refetchInterval: 30 * 60 * 1000 });
  const style = shared && bookId ? { viewTransitionName: `book-${bookId}` } : undefined;
  const source = privateCover ? resolved.data : src;
  const url = source ? (source.includes("openlibrary") ? `${source}?default=false` : source) : null;

  if (!url || failedSrc === url) {
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
      onError={() => setFailedSrc(url)}
      className={cn("book-cover aspect-[2/3] w-full", className)}
    />
  );
}
