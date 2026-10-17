import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Book, Category } from "@/types/library";
import { BookCover } from "./BookCover";
import { cn } from "@/lib/utils";

const toneBg = {
  blue: "bg-primary/25",
  lime: "bg-lime/55",
  gray: "bg-bluegray/70",
} as const;

/** Readly-style shelf: overlapping covers peeking above a translucent coloured slab. */
export function CategoryCard({ category, books, count }: { category: Category; books: Book[]; count: number }) {
  const covers = books.slice(0, 4);
  return (
    <Link
      to="/explore"
      search={{ category: category.slug }}
      className="group block w-[260px] shrink-0 snap-start sm:w-auto"
    >
      <div className="relative h-44">
        <div className="absolute inset-x-3 top-2 flex justify-center gap-1">
          {covers.map((b, i) => (
            <div
              key={b.id}
              className="w-[22%] transition-transform duration-300 group-hover:-translate-y-2"
              style={{ transform: `rotate(${(i - 1.5) * 4}deg)`, transitionDelay: `${i * 30}ms` }}
            >
              <BookCover src={b.coverUrl} title={b.title} />
            </div>
          ))}
          {!covers.length && <div className="h-24" />}
        </div>
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 h-24 rounded-3xl backdrop-blur-md",
            toneBg[category.tone],
          )}
        />
        <span className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-card shadow-soft transition-transform group-hover:rotate-90">
          <Plus className="size-4" />
        </span>
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-sm font-bold">{category.name}</h3>
        <p className="text-xs text-muted-foreground">{count} {count === 1 ? "Book" : "Books"}</p>
      </div>
    </Link>
  );
}
