import { createFileRoute } from "@tanstack/react-router";
import { MyLibraryView } from "@/components/books/MyLibraryView";

export const Route = createFileRoute("/_authenticated/my-library/")({
  head: () => ({
    meta: [
      { title: "My Library — Smart Library" },
      { name: "description", content: "Everything you've borrowed, reserved and saved." },
      { property: "og:title", content: "My Library — Smart Library" },
      { property: "og:description", content: "Everything you've borrowed, reserved and saved." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <MyLibraryView tab="all" />,
});
