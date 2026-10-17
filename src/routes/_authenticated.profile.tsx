import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { CalendarClock, ChevronRight, Heart, Receipt, Settings, ShieldCheck } from "lucide-react";
import { Page } from "@/components/layout/AppLayout";
import { Field, inputCls } from "@/components/forms/AuthShell";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingSkeleton } from "@/components/shared/states";
import { useProfile, useRoles, qk } from "@/hooks/use-library";
import { library } from "@/services";
import type { Profile } from "@/types/library";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Smart Library" },
      { name: "description", content: "Your Smart Library profile and account details." },
      { property: "og:title", content: "Profile — Smart Library" },
      { property: "og:description", content: "Your Smart Library profile." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  universityId: z.string().trim().max(40),
  department: z.string().trim().max(80),
  semester: z.string().trim().max(20),
});

const roleLabel = { student: "Student", faculty: "Faculty Member", librarian: "Librarian", admin: "Administrator" };

export function ProfileCard({ profile, roles }: { profile: Profile; roles: string[] }) {
  const initials = (profile.fullName || profile.email || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="relative overflow-hidden rounded-3xl bg-card p-6 text-center shadow-soft">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 aura-bg opacity-70 blur-xl" />
      <div className="relative mx-auto grid size-20 place-items-center overflow-hidden rounded-full bg-lime text-2xl font-extrabold ring-4 ring-card">
        {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="size-full object-cover" /> : initials}
      </div>
      <h1 className="relative mt-4 text-xl font-extrabold tracking-tight">{profile.fullName || "Unnamed reader"}</h1>
      <p className="relative text-sm text-muted-foreground">{profile.email}</p>
      <div className="relative mt-3 flex flex-wrap justify-center gap-1.5">
        {roles.map((r) => (
          <span key={r} className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
            <ShieldCheck className="size-3" /> {roleLabel[r as keyof typeof roleLabel] ?? r}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const { data: roles = [] } = useRoles();
  const qc = useQueryClient();
  const [form, setForm] = useState({ fullName: "", universityId: "", department: "", semester: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile)
      setForm({ fullName: profile.fullName, universityId: profile.universityId ?? "", department: profile.department ?? "", semester: profile.semester ?? "" });
  }, [profile]);

  if (isLoading) return <LoadingSkeleton variant="list" count={3} />;
  if (error || !profile) return <ErrorState message={error?.message ?? "Profile not found."} />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) return setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    setBusy(true);
    try {
      await library.updateProfile(profile.id, r.data);
      await qc.invalidateQueries({ queryKey: qk.profile(profile.id) });
      toast.success("Profile updated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const links = [
    { to: "/due-dates", label: "Due dates", icon: CalendarClock },
    { to: "/favorites", label: "Favorites", icon: Heart },
    { to: "/fines", label: "Fines", icon: Receipt },
    { to: "/settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <Page>
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <ProfileCard profile={profile} roles={roles} />
          <nav className="overflow-hidden rounded-3xl bg-card shadow-soft">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-3 border-b px-5 py-4 text-sm font-semibold last:border-0 hover:bg-muted">
                <Icon className="size-4 text-primary" /> <span className="flex-1">{label}</span> <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </nav>
        </div>
        <form onSubmit={save} noValidate className="space-y-4 rounded-3xl bg-card p-6 shadow-soft">
          <h2 className="text-lg font-extrabold tracking-tight">Personal information</h2>
          <Field id="fullName" label="Full name" error={errors.fullName}>
            <input id="fullName" className={inputCls} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </Field>
          <Field id="email" label="Email (managed by your account)">
            <input id="email" className={inputCls} value={profile.email ?? ""} disabled />
          </Field>
          <Field id="universityId" label="University ID" error={errors.universityId}>
            <input id="universityId" className={inputCls} value={form.universityId} onChange={(e) => setForm({ ...form, universityId: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="department" label="Department" error={errors.department}>
              <input id="department" className={inputCls} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </Field>
            <Field id="semester" label="Semester" error={errors.semester}>
              <input id="semester" className={inputCls} value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
            </Field>
          </div>
          <p className="text-xs text-muted-foreground">Your role is assigned by library administrators and can't be changed here.</p>
          <Button type="submit" variant="hero" size="pill" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </div>
    </Page>
  );
}
