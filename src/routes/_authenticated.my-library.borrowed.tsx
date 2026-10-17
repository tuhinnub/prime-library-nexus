import { createFileRoute } from "@tanstack/react-router";
import { MyLibraryView } from "@/components/books/MyLibraryView";

export const Route = createFileRoute("/_authenticated/my-library/borrowed")({
  head: () => ({
    meta: [
      { title: "Borrowed Books — Smart Library" },
      { name: "description", content: "Books currently on loan to you." },
      { property: "og:title", content: "Borrowed Books — Smart Library" },
      { property: "og:description", content: "Books currently on loan to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <MyLibraryView tab="borrowed" />,
});
