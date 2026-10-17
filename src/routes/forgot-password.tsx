import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthShell, Field, inputCls } from "@/components/forms/AuthShell";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Smart Library" },
      { name: "description", content: "Get a link to reset your Smart Library password." },
      { property: "og:title", content: "Reset your password" },
      { property: "og:description", content: "Get a link to reset your Smart Library password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = z.string().trim().email().safeParse(email);
    if (!r.success) return setErr("Enter a valid email address");
    setErr(undefined);
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(r.data, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
  };

  return (
    <AuthShell muted="Forgot your" title="Password?" compact>
      {sent ? (
        <p className="text-center text-sm text-muted-foreground">If an account exists for that email, a reset link is on its way.</p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field id="email" label="Email" error={err}>
            <input id="email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
          </Field>
          <Button type="submit" variant="hero" size="xl" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-bold text-primary">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}
