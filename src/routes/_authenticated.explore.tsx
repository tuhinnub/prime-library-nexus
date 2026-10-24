import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Page, PageTitle } from "@/components/layout/AppLayout";
import { BookCard, BookGrid, FeaturedBookCard } from "@/components/books/BookCard";
import { Chip, FilterPanel, SearchBar, useDebounced } from "@/components/books/SearchFilters";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/shared/states";
import { useAuthors, useBooks, useCategories } from "@/hooks/use-library";
import type { BookFilters, SortKey } from "@/types/library";

const SORTS: SortKey[] = ["popular", "recent", "title", "rating"];

export const Route = createFileRoute("/_authenticated/explore")({
  validateSearch: (s: Record<string, unknown>): BookFilters => ({
    q: typeof s.q === "string" && s.q ? s.q.slice(0, 100) : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    author: typeof s.author === "string" ? s.author : undefined,
    language: typeof s.language === "string" ? s.language : undefined,
    year: s.year ? Number(s.year) || undefined : undefined,
    availableOnly: s.availableOnly === true || s.availableOnly === "true" ? true : undefined,
    sort: SORTS.includes(s.sort as SortKey) ? (s.sort as SortKey) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore Books — গ্রন্থাগার" },
      { name: "description", content: "Search the catalogue by title, author, ISBN, category or department." },
      { property: "og:title", content: "Explore Books — গ্রন্থাগার" },
      { property: "og:description", content: "Discover your next great read." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Explore,
});

function Explore() {
  const filters = Route.useSearch();
  const navigate = useNavigate({ from: "/explore" });
  const [q, setQ] = useState(filters.q ?? "");
  const [open, setOpen] = useState(false);
  const dq = useDebounced(q);

  const update = (patch: Partial<BookFilters>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  useEffect(() => {
    if ((dq || undefined) !== filters.q) update({ q: dq || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq]);

  const books = useBooks(filters);
  const all = useBooks({});
  const cats = useCategories();
  const authors = useAuthors();

  const languages = useMemo(() => [...new Set((all.data ?? []).map((b) => b.language))].sort(), [all.data]);
  const years = useMemo(
    () => [...new Set((all.data ?? []).map((b) => b.publicationYear).filter(Boolean) as number[])].sort((a, b) => b - a),
    [all.data],
  );
  const featured = (all.data ?? []).filter((b) => b.featured);
  const isFiltered = !!(filters.q || filters.category || filters.author || filters.language || filters.year || filters.availableOnly);

  return (
    <Page>
      <PageTitle title="Explore Books" subtitle="Discover your next great read." />
      <SearchBar value={q} onChange={setQ} onToggleFilters={() => setOpen((o) => !o)} filtersOpen={open} />
      <FilterPanel open={open} filters={filters} categories={cats.data ?? []} authors={authors.data ?? []} languages={languages} years={years} onChange={update} />

      <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 py-1 md:mx-0 md:px-0" role="group" aria-label="Categories">
        <Chip active={!filters.category} onClick={() => update({ category: undefined })}>
          All
        </Chip>
        {(cats.data ?? []).map((c) => (
          <Chip key={c.id} active={filters.category === c.slug} onClick={() => update({ category: c.slug })}>
            {c.name}
          </Chip>
        ))}
      </div>

      {!isFiltered && featured.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-extrabold tracking-tight">Featured</h2>
          <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:px-0">
            {featured.map((b) => (
              <FeaturedBookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">{isFiltered ? "Results" : "All Books"}</h2>
          {books.data && <span className="text-xs text-muted-foreground">{books.data.length} books</span>}
        </div>
        {books.isLoading ? (
          <LoadingSkeleton count={12} />
        ) : books.error ? (
          <ErrorState message={books.error.message} onRetry={() => books.refetch()} />
        ) : books.data?.length ? (
          <BookGrid>
            {books.data.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </BookGrid>
        ) : (
          <EmptyState title="No books match" description="Try a different search term or clear some filters." />
        )}
      </section>
    </Page>
  );
}
