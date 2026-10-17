import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import type { Book } from "@/types/library";
import { BookCover } from "./BookCover";
import { AvailabilityBadge } from "./badges";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/use-library";
import type { ReactNode } from "react";

export function FavoriteButton({ bookId, className }: { bookId: string; className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: ids = [] } = useFavoriteIds();
  const toggle = useToggleFavorite();
  const fav = ids.includes(bookId);
  return (
    <button
      type="button"
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={fav}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return navigate({ to: "/login" });
        toggle.mutate({ bookId, fav });
      }}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-card/95 shadow-soft backdrop-blur transition-transform hover:scale-105",
        className,
      )}
    >
      <Heart className={cn("size-4", fav ? "fill-primary text-primary" : "text-muted-foreground")} />
    </button>
  );
}

interface Props {
  book: Book;
  meta?: ReactNode;
  hideAvailability?: boolean;
}

export function BookCard({ book, meta, hideAvailability }: Props) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link
        to="/books/$id"
        params={{ id: book.id }}
        viewTransition
        className="block rounded-xl focus-visible:outline-offset-4"
      >
        <div className="relative">
          <div className="transition-transform duration-300 group-hover:-translate-y-1.5">
            <BookCover bookId={book.id} src={book.coverUrl} title={book.title} shared />
          </div>
          <FavoriteButton bookId={book.id} className="absolute right-2 top-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100" />
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="line-clamp-1 text-sm font-bold tracking-tight">{book.title}</h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {book.authors.join(", ") || "Unknown author"}
            {book.category ? ` · ${book.category.name}` : ""}
          </p>
          {meta ?? (!hideAvailability && <AvailabilityBadge available={book.availableCopies} total={book.totalCopies} />)}
        </div>
      </Link>
    </motion.article>
  );
}

export function BookGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {children}
    </div>
  );
}

export function FeaturedBookCard({ book }: { book: Book }) {
  return (
    <Link
      to="/books/$id"
      params={{ id: book.id }}
      viewTransition
      className="group relative flex w-[290px] shrink-0 snap-start items-end gap-4 overflow-hidden rounded-3xl bg-card p-5 shadow-soft sm:w-[340px]"
    >
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary-soft to-transparent" />
      <div className="relative w-24 shrink-0 -rotate-3 transition-transform duration-300 group-hover:rotate-0">
        <BookCover bookId={book.id} src={book.coverUrl} title={book.title} shared />
      </div>
      <div className="relative min-w-0 pb-1">
        <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Featured</span>
        <h3 className="mt-2 line-clamp-2 text-base font-extrabold leading-tight tracking-tight">{book.title}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{book.authors.join(", ")}</p>
        <p className="mt-2 text-xs font-semibold text-primary">★ {book.rating.toFixed(1)}</p>
      </div>
    </Link>
  );
}
