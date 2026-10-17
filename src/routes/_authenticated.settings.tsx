import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Page, PageTitle } from "@/components/layout/AppLayout";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/states";
import { useAuth } from "@/contexts/auth-context";
import { qk, useProfile } from "@/hooks/use-library";
import { library } from "@/services";
import type { Profile } from "@/types/library";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Smart Library" },
      { name: "description", content: "Account, notification and language preferences." },
      { property: "og:title", content: "Settings — Smart Library" },
      { property: "og:description", content: "Account, notification and language preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: p, isLoading } = useProfile();
  const { signOut } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const patch = async (v: Partial<Profile>) => {
    if (!p) return;
    const key = qk.profile(p.id);
    const prev = qc.getQueryData<Profile>(key);
    qc.setQueryData<Profile>(key, { ...p, ...v });
    try {
      await library.updateProfile(p.id, v);
      toast.success("Preferences saved");
    } catch (e) {
      qc.setQueryData(key, prev);
      toast.error((e as Error).message);
    }
  };

  if (isLoading || !p) return <LoadingSkeleton variant="list" count={3} />;

  const card = "rounded-3xl bg-card p-6 shadow-soft";
  return (
    <Page>
      <PageTitle title="Settings" />
      <div className="mx-auto max-w-2xl space-y-4">
        <section className={card}>
          <h2 className="mb-4 font-extrabold">Account</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{p.email}</span>
            <Link to="/profile" className="font-semibold text-primary">Edit profile</Link>
          </div>
          <Link to="/forgot-password" className="mt-3 inline-block text-sm font-semibold text-primary">Change password</Link>
        </section>
        <section className={card}>
          <h2 className="mb-4 font-extrabold">Notification preferences</h2>
          <label className="flex items-center justify-between py-2 text-sm">
            Email notifications
            <Switch checked={p.notifyEmail} onCheckedChange={(v) => patch({ notifyEmail: v })} />
          </label>
          <label className="flex items-center justify-between py-2 text-sm">
            Due date reminders
            <Switch checked={p.notifyDueDates} onCheckedChange={(v) => patch({ notifyDueDates: v })} />
          </label>
        </section>
        <section className={card}>
          <h2 className="mb-4 font-extrabold">Language</h2>
          <select
            aria-label="Language"
            value={p.language}
            onChange={(e) => patch({ language: e.target.value })}
            className="h-11 w-full rounded-2xl border bg-card px-3 text-sm outline-none focus:border-primary"
          >
            <option value="en">English</option>
            <option value="bn">বাংলা (Bangla)</option>
          </select>
          <p className="mt-2 text-xs text-muted-foreground">Saved to your profile. Interface translations are coming later.</p>
        </section>
        <Button
          variant="soft"
          size="xl"
          onClick={async () => {
            await signOut();
            qc.clear();
            navigate({ to: "/login" });
          }}
        >
          <LogOut className="!size-4" /> Log out
        </Button>
      </div>
    </Page>
  );
}
