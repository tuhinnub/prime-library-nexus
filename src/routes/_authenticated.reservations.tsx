import { createFileRoute } from "@tanstack/react-router";
import { MyLibraryView } from "@/components/books/MyLibraryView";

export const Route = createFileRoute("/_authenticated/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations — গ্রন্থাগার" },
      { name: "description", content: "Track your book reservations." },
      { property: "og:title", content: "Reservations — গ্রন্থাগার" },
      { property: "og:description", content: "Track your book reservations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <MyLibraryView tab="reserved" />,
});
