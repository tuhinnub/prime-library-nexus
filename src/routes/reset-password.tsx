import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthShell, Field, inputCls } from "@/components/forms/AuthShell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — Smart Library" },
      { name: "description", content: "Set a new password for your Smart Library account." },
      { property: "og:title", content: "Choose a new password" },
      { property: "og:description", content: "Set a new password for your Smart Library account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setErr("Use at least 8 characters");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  };
  return (
    <AuthShell muted="Choose a" title="New Password" compact>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field id="pw" label="New password" error={err}>
          <input id="pw" type="password" autoComplete="new-password" className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <Button type="submit" variant="hero" size="xl" disabled={busy}>
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
