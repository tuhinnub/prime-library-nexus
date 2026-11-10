import { createFileRoute } from "@tanstack/react-router";
import { Explore } from "@/components/books/PublicCatalogueView";
import { publicCatalogueQuery } from "@/services/public-catalogue";
import { PublicLibraryLayout } from "@/components/layout/PublicLibraryLayout";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/shared/states";
import type { BookFilters, SortKey } from "@/types/library";
const SORTS: SortKey[] = ["popular", "recent", "title", "rating", "author"];

export const Route = createFileRoute("/explore")({
  validateSearch: (s: Record<string, unknown>): BookFilters => ({
    q: typeof s.q === "string" && s.q ? s.q.slice(0, 100) : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    author: typeof s.author === "string" ? s.author : undefined,
    language: typeof s.language === "string" ? s.language : undefined,
    year: s.year ? Number(s.year) || undefined : undefined,
    availableOnly: s.availableOnly === true || s.availableOnly === "true" ? true : undefined,
    sort: SORTS.includes(s.sort as SortKey) ? (s.sort as SortKey) : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publicCatalogueQuery),
  pendingComponent: () => <PublicLibraryLayout><LoadingSkeleton count={12} /></PublicLibraryLayout>,
  errorComponent: () => <PublicLibraryLayout><ErrorState message="The catalogue could not be loaded. Please try again." onRetry={() => window.location.reload()} /></PublicLibraryLayout>,
  notFoundComponent: () => <PublicLibraryLayout><EmptyState title="Catalogue not found" /></PublicLibraryLayout>,
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

