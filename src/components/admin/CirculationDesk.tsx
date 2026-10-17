import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { library } from "@/services";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/forms/AuthShell";
import { ReservationBadge } from "@/components/books/badges";
import { formatDate } from "@/lib/due";
import { useSettings, qk } from "@/hooks/use-library";

const card = "rounded-3xl bg-card p-6 shadow-soft";

function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}

export function CirculationDesk() {
  const refresh = useRefresh();
  const [email, setEmail] = useState("");
  const [barcode, setBarcode] = useState("");
  const [retBarcode, setRetBarcode] = useState("");

  const checkout = useMutation({
    mutationFn: () => library.staffCheckout(email, barcode),
    onSuccess: () => {
      toast.success("Book checked out");
      setBarcode("");
      refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const ret = useMutation({
    mutationFn: () => library.staffReturn(retBarcode),
    onSuccess: (r) => {
      toast.success(r.fine > 0 ? `Returned — ${r.overdue_days} days late, fine ${r.fine}` : "Returned on time");
      setRetBarcode("");
      refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form className={card} onSubmit={(e) => { e.preventDefault(); checkout.mutate(); }}>
        <h2 className="mb-1 font-extrabold">Check out</h2>
        <p className="mb-4 text-xs text-muted-foreground">Lend a physical copy to a member. Matching reservations are completed.</p>
        <div className="space-y-3">
          <input aria-label="Member email" required type="email" className={inputCls} placeholder="Member email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input aria-label="Copy barcode" required className={inputCls} placeholder="Copy barcode, e.g. SL-211292-01" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          <Button variant="hero" size="pill" disabled={checkout.isPending}>Check out</Button>
        </div>
      </form>
      <form className={card} onSubmit={(e) => { e.preventDefault(); ret.mutate(); }}>
        <h2 className="mb-1 font-extrabold">Return</h2>
        <p className="mb-4 text-xs text-muted-foreground">Fines are calculated automatically from the library rate.</p>
        <div className="space-y-3">
          <input aria-label="Return barcode" required className={inputCls} placeholder="Copy barcode" value={retBarcode} onChange={(e) => setRetBarcode(e.target.value)} />
          <Button variant="hero" size="pill" disabled={ret.isPending}>Mark returned</Button>
        </div>
      </form>
      <ReservationsQueue />
      <FinesDesk />
      <RulesForm />
      <CopyLookup />
    </div>
  );
}

function ReservationsQueue() {
  const refresh = useRefresh();
  const { data = [], isLoading } = useQuery({ queryKey: ["staff-res"], queryFn: () => library.staffPendingReservations() });
  const set = useMutation({
    mutationFn: ({ id, s }: { id: string; s: "approved" | "ready_for_pickup" | "cancelled" }) => library.staffSetReservation(id, s),
    onSuccess: () => { toast.success("Reservation updated"); refresh(); },
    onError: (e) => toast.error((e as Error).message),
  });
  return (
    <section className={`${card} lg:col-span-2`}>
      <h2 className="mb-4 font-extrabold">Active reservations</h2>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !data.length ? <p className="text-sm text-muted-foreground">No active reservations.</p> : (
        <ul className="divide-y">
          {data.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{r.bookTitle}</p>
                <p className="text-xs text-muted-foreground">{r.memberName || r.memberEmail} · {formatDate(r.reservedAt)}</p>
              </div>
              <ReservationBadge status={r.status} />
              {r.status === "pending" && <Button size="sm" variant="soft" onClick={() => set.mutate({ id: r.id, s: "approved" })}>Approve</Button>}
              {r.status !== "ready_for_pickup" && <Button size="sm" variant="lime" onClick={() => set.mutate({ id: r.id, s: "ready_for_pickup" })}>Ready</Button>}
              <Button size="sm" variant="ghost" onClick={() => set.mutate({ id: r.id, s: "cancelled" })}>Cancel</Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FinesDesk() {
  const refresh = useRefresh();
  const { data = [] } = useQuery({ queryKey: ["staff-fines"], queryFn: () => library.staffUnpaidFines() });
  const pay = useMutation({
    mutationFn: (id: string) => library.staffMarkFinePaid(id),
    onSuccess: () => { toast.success("Fine marked as paid"); refresh(); },
    onError: (e) => toast.error((e as Error).message),
  });
  return (
    <section className={card}>
      <h2 className="mb-1 font-extrabold">Unpaid fines</h2>
      <p className="mb-4 text-xs text-muted-foreground">Record cash payments taken at the desk.</p>
      {!data.length ? <p className="text-sm text-muted-foreground">No unpaid fines.</p> : (
        <ul className="divide-y">
          {data.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-3 text-sm">
              <span className="min-w-0 flex-1 truncate">{f.memberEmail} · {f.overdueDays}d</span>
              <b>{f.amount}</b>
              <Button size="sm" variant="soft" onClick={() => pay.mutate(f.id)}>Paid</Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RulesForm() {
  const qc = useQueryClient();
  const { data: s } = useSettings();
  const [v, setV] = useState({ loanDays: 14, finePerDay: 0, maxActiveReservations: 3 });
  useEffect(() => { if (s) setV({ loanDays: s.loanDays, finePerDay: s.finePerDay, maxActiveReservations: s.maxActiveReservations }); }, [s]);
  const save = useMutation({
    mutationFn: () => library.updateSettings(v),
    onSuccess: () => { toast.success("Library rules saved"); qc.invalidateQueries({ queryKey: qk.settings }); },
    onError: (e) => toast.error((e as Error).message),
  });
  const num = (k: keyof typeof v, label: string, step = "1") => (
    <label className="space-y-1 text-xs font-semibold text-muted-foreground">
      {label}
      <input type="number" min="0" step={step} className={inputCls} value={v[k]} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })} />
    </label>
  );
  return (
    <form className={card} onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <h2 className="mb-4 font-extrabold">Library rules {s && <span className="text-xs font-semibold text-muted-foreground">({s.currency})</span>}</h2>
      <div className="grid grid-cols-3 gap-3">
        {num("loanDays", "Loan days")}
        {num("finePerDay", "Fine / day", "0.5")}
        {num("maxActiveReservations", "Max holds")}
      </div>
      <Button className="mt-4" variant="hero" size="pill" disabled={save.isPending}>Save rules</Button>
      <p className="mt-2 text-xs text-muted-foreground">Only administrators can change rules.</p>
    </form>
  );
}

function CopyLookup() {
  const [q, setQ] = useState("");
  const { data: books = [] } = useQuery({ queryKey: ["books", { q }], queryFn: () => library.listBooks({ q }), enabled: q.length > 1 });
  return (
    <section className={card}>
      <h2 className="mb-1 font-extrabold">Find a book</h2>
      <p className="mb-4 text-xs text-muted-foreground">Search the catalogue to check availability before lending.</p>
      <input aria-label="Search catalogue" className={inputCls} placeholder="Title or ISBN" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="mt-3 space-y-1 text-sm">
        {books.slice(0, 5).map((b) => (
          <li key={b.id} className="flex justify-between"><span className="truncate">{b.title}</span><span className="text-muted-foreground">{b.availableCopies}/{b.totalCopies}</span></li>
        ))}
      </ul>
    </section>
  );
}
