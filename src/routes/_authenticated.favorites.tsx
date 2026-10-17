import { createFileRoute } from "@tanstack/react-router";
import { MyLibraryView } from "@/components/books/MyLibraryView";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — Smart Library" },
      { name: "description", content: "Books you've saved." },
      { property: "og:title", content: "Favorites — Smart Library" },
      { property: "og:description", content: "Books you've saved." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <MyLibraryView tab="favorites" />,
});
