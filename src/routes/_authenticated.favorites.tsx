import { createFileRoute } from "@tanstack/react-router";
import { MyLibraryView } from "@/components/books/MyLibraryView";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — গ্রন্থাগার" },
      { name: "description", content: "Books you've saved." },
      { property: "og:title", content: "Favorites — গ্রন্থাগার" },
      { property: "og:description", content: "Books you've saved." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <MyLibraryView tab="favorites" />,
});
