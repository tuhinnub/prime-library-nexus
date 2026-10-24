import { createFileRoute } from "@tanstack/react-router";
import { MyLibraryView } from "@/components/books/MyLibraryView";

export const Route = createFileRoute("/_authenticated/my-library/history")({
  head: () => ({
    meta: [
      { title: "Borrowing History — গ্রন্থাগার" },
      { name: "description", content: "Books you've returned." },
      { property: "og:title", content: "Borrowing History — গ্রন্থাগার" },
      { property: "og:description", content: "Books you've returned." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <MyLibraryView tab="history" />,
});
