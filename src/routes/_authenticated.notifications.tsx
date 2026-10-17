import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Page, PageTitle } from "@/components/layout/AppLayout";
import { NotificationCard } from "@/components/books/cards";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { useMarkRead, useNotifications } from "@/hooks/use-library";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Smart Library" },
      { name: "description", content: "Reservation updates, availability alerts and due date reminders." },
      { property: "og:title", content: "Notifications — Smart Library" },
      { property: "og:description", content: "Reservation updates and reminders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const { data, isLoading, error, refetch } = useNotifications();
  const mark = useMarkRead();
  const unread = (data ?? []).filter((n) => !n.readAt).length;
  return (
    <Page>
      <PageTitle
        title="Notifications"
        subtitle={`${unread} unread`}
        action={
          unread > 0 && (
            <Button variant="soft" size="pill" onClick={() => mark.mutate(undefined)}>
              Mark all read
            </Button>
          )
        }
      />
      {isLoading ? (
        <LoadingSkeleton variant="list" count={4} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState title="You're all caught up" />
      ) : (
        <div className="mx-auto max-w-2xl space-y-3">
          <AnimatePresence>
            {data.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <NotificationCard n={n} onRead={() => mark.mutate([n.id])} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Page>
  );
}
