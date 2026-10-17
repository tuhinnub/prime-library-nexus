import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { AuthShell, Field, GoogleButton, inputCls } from "@/components/forms/AuthShell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Smart Library" },
      { name: "description", content: "Sign in to your Smart Library account." },
      { property: "og:title", content: "Log in to Smart Library" },
      { property: "og:description", content: "A better way to explore books." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEmail, setShowEmail] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(r.data);
    setBusy(false);
    if (error) return toast.error(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
    toast.success("Welcome back!");
  };

  return (
    <AuthShell muted="A Better Way" title="to Explore Books">
      <AnimatePresence mode="wait">
        {!showEmail ? (
          <motion.div key="opts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <Button variant="hero" size="xl" onClick={() => setShowEmail(true)}>
              <Mail className="!size-5" /> Continue with Email
            </Button>
            <GoogleButton />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Field id="email" label="Email" error={errors.email}>
              <input id="email" type="email" autoComplete="email" className={inputCls} value={form.email} aria-invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@university.edu" />
            </Field>
            <Field id="password" label="Password" error={errors.password}>
              <input id="password" type="password" autoComplete="current-password" className={inputCls} value={form.password} aria-invalid={!!errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </Field>
            <div className="flex justify-between text-xs">
              <button type="button" onClick={() => setShowEmail(false)} className="font-semibold text-muted-foreground hover:text-foreground">
                ← Other options
              </button>
              <Link to="/forgot-password" className="font-semibold text-primary">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" variant="hero" size="xl" disabled={busy}>
              {busy ? "Signing in…" : "Log in"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="font-bold text-foreground hover:text-primary">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
