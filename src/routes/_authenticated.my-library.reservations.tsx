import { createFileRoute } from "@tanstack/react-router";
import { MyLibraryView } from "@/components/books/MyLibraryView";

export const Route = createFileRoute("/_authenticated/my-library/reservations")({
  head: () => ({
    meta: [
      { title: "My Reservations — গ্রন্থাগার" },
      { name: "description", content: "Your active and past reservations." },
      { property: "og:title", content: "My Reservations — গ্রন্থাগার" },
      { property: "og:description", content: "Your active and past reservations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <MyLibraryView tab="reserved" />,
});
