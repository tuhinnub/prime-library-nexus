import { Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { BookFilters, Category, SortKey } from "@/types/library";
import { cn } from "@/lib/utils";

export function SearchBar({ value, onChange, onToggleFilters, filtersOpen }: { value: string; onChange: (v: string) => void; onToggleFilters?: () => void; filtersOpen?: boolean }) {
  return (
    <div className="flex gap-2">
      <label className="flex h-12 flex-1 items-center gap-3 rounded-full border bg-card px-5 shadow-soft focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="size-4 text-muted-foreground" />
        <span className="sr-only">Search books</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Title, author, ISBN, category, department"
          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        />
        {value && (
          <button onClick={() => onChange("")} aria-label="Clear search">
            <X className="size-4 text-muted-foreground" />
          </button>
        )}
      </label>
      {onToggleFilters && (
        <button
          onClick={onToggleFilters}
          aria-expanded={filtersOpen}
          aria-label="Filters"
          className={cn("grid size-12 place-items-center rounded-full transition-colors", filtersOpen ? "bg-primary text-primary-foreground" : "bg-ink text-primary-foreground")}
        >
          <SlidersHorizontal className="size-4" />
        </button>
      )}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all",
        active ? "bg-ink text-primary-foreground" : "bg-card text-muted-foreground shadow-soft hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const sorts: { k: SortKey; label: string }[] = [
  { k: "popular", label: "Most Popular" },
  { k: "recent", label: "Recently Added" },
  { k: "title", label: "Title A–Z" },
  { k: "rating", label: "Highest Rated" },
];

const selectCls = "h-11 w-full rounded-2xl border bg-card px-3 text-sm shadow-soft outline-none focus:border-primary";

export function FilterPanel({
  open,
  filters,
  authors,
  languages,
  years,
  onChange,
}: {
  open: boolean;
  filters: BookFilters;
  categories: Category[];
  authors: string[];
  languages: string[];
  years: number[];
  onChange: (f: Partial<BookFilters>) => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-4 grid gap-3 rounded-3xl bg-card p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              Author
              <select className={selectCls} value={filters.author ?? ""} onChange={(e) => onChange({ author: e.target.value || undefined })}>
                <option value="">Any author</option>
                {authors.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              Language
              <select className={selectCls} value={filters.language ?? ""} onChange={(e) => onChange({ language: e.target.value || undefined })}>
                <option value="">Any language</option>
                {languages.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              Publication year
              <select className={selectCls} value={filters.year ?? ""} onChange={(e) => onChange({ year: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">Any year</option>
                {years.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              Sort by
              <select className={selectCls} value={filters.sort ?? "popular"} onChange={(e) => onChange({ sort: e.target.value as SortKey })}>
                {sorts.map((s) => (
                  <option key={s.k} value={s.k}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2 lg:col-span-4">
              <input type="checkbox" className="size-4 accent-primary" checked={!!filters.availableOnly} onChange={(e) => onChange({ availableOnly: e.target.checked || undefined })} />
              Only show books available now
            </label>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}
