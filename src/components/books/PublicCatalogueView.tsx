import { useSearch, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Page, PageTitle } from "@/components/layout/AppLayout";
import { BookCard, BookGrid, FeaturedBookCard } from "@/components/books/BookCard";
import { Chip, FilterPanel, SearchBar, useDebounced } from "@/components/books/SearchFilters";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/shared/states";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicCatalogueQuery } from "@/services/public-catalogue";
import { filterCatalogue } from "@/services/catalogue";
import { PublicLibraryLayout } from "@/components/layout/PublicLibraryLayout";
import type { BookFilters, SortKey } from "@/types/library";

export function Explore() {
  const filters: BookFilters = useSearch({ strict: false });
  const navigate = useNavigate({ from: "/explore" });
  const [q, setQ] = useState(filters.q ?? "");
  const [open, setOpen] = useState(false);
  const dq = useDebounced(q);

  const update = (patch: Partial<BookFilters>) => navigate({ to: "/explore", search: { ...filters, ...patch }, replace: true });
  useEffect(() => {
    if ((dq || undefined) !== filters.q) update({ q: dq || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq]);

  const { data: catalogue } = useSuspenseQuery(publicCatalogueQuery);
  const all = { data: catalogue.books };
  const books = { data: filterCatalogue(catalogue.books, filters) };
  const cats = { data: catalogue.categories };
  const authors = { data: [...new Set(catalogue.books.flatMap(b => b.authors))].sort() };

  const languages = useMemo(() => [...new Set((all.data ?? []).map((b) => b.language))].sort(), [all.data]);
  const years = useMemo(
    () => [...new Set((all.data ?? []).map((b) => b.publicationYear).filter(Boolean) as number[])].sort((a, b) => b - a),
    [all.data],
  );
  const featured = (all.data ?? []).filter((b) => b.featured);
  const isFiltered = !!(filters.q || filters.category || filters.author || filters.language || filters.year || filters.availableOnly);

  return (
    <PublicLibraryLayout><Page>
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
        {books.data?.length ? (
          <BookGrid>
            {books.data.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </BookGrid>
        ) : (
          <EmptyState title="No books match" description="Try a different search term or clear some filters." />
        )}
      </section>
    </Page></PublicLibraryLayout>
  );
}
