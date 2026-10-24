import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/layout/AppLayout";
import { FineCard } from "@/components/books/cards";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/shared/states";
import { useFines, useSettings } from "@/hooks/use-library";

export const Route = createFileRoute("/_authenticated/fines")({
  head: () => ({
    meta: [
      { title: "Fines — গ্রন্থাগার" },
      { name: "description", content: "Outstanding and paid library fines." },
      { property: "og:title", content: "Fines — গ্রন্থাগার" },
      { property: "og:description", content: "Outstanding and paid library fines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Fines,
});

function Fines() {
  const { data, isLoading, error, refetch } = useFines();
  const { data: s } = useSettings();
  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: s?.currency ?? "BDT" }).format(n);
  const outstanding = (data ?? []).filter((f) => f.status === "unpaid");
  const paid = (data ?? []).filter((f) => f.status !== "unpaid");
  const owed = outstanding.reduce((a, f) => a + f.amount, 0);

  return (
    <Page>
      <PageTitle title="Fines" subtitle={s ? `Library rate: ${fmt(s.finePerDay)} per overdue day` : undefined} />
      <div className="mb-8 rounded-3xl bg-ink p-6 text-primary-foreground">
        <p className="text-xs font-semibold opacity-70">Outstanding balance</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight">{fmt(owed)}</p>
        <p className="mt-3 text-xs opacity-70">Pay at the library desk. Online payment isn't enabled for this library yet.</p>
      </div>
      {isLoading ? (
        <LoadingSkeleton variant="list" count={2} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState title="No fines" description="Return books on time and this stays empty." />
      ) : (
        <div className="space-y-8">
          {outstanding.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-muted-foreground">Outstanding</h2>
              <div className="grid gap-3 lg:grid-cols-2">{outstanding.map((f) => <FineCard key={f.id} f={f} />)}</div>
            </section>
          )}
          {paid.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-muted-foreground">History</h2>
              <div className="grid gap-3 lg:grid-cols-2">{paid.map((f) => <FineCard key={f.id} f={f} />)}</div>
            </section>
          )}
        </div>
      )}
    </Page>
  );
}
