import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { AuthShell, Field, GoogleButton, inputCls } from "@/components/forms/AuthShell";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — গ্রন্থাগার" },
      { name: "description", content: "Join গ্রন্থাগার to reserve books and track due dates." },
      { property: "og:title", content: "Join গ্রন্থাগার" },
      { property: "og:description", content: "Reserve books, track due dates, and manage your library activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Register,
});

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(120),
    email: z.string().trim().email("Enter a valid email address").max(255),
    password: z.string().min(8, "Use at least 8 characters").max(72),
    confirm: z.string(),
    universityId: z.string().trim().max(40).optional(),
    department: z.string().trim().max(80).optional(),
    semester: z.string().trim().max(20).optional(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

type Form = z.input<typeof schema>;

function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({ fullName: "", email: "", password: "", confirm: "", universityId: "", department: "", semester: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: r.data.email,
      password: r.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: r.data.fullName,
          university_id: r.data.universityId,
          department: r.data.department,
          semester: r.data.semester,
        },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (!data.session) setSent(true);
  };

  if (sent)
    return (
      <AuthShell muted="Almost there" title="Check your inbox" compact>
        <p className="text-center text-sm text-muted-foreground">
          We sent a confirmation link to <b className="text-foreground">{form.email}</b>. Open it to activate your account.
        </p>
        <Button asChild variant="hero" size="xl" className="mt-6">
          <Link to="/login">Back to log in</Link>
        </Button>
      </AuthShell>
    );

  const f = (k: keyof Form, label: string, type = "text", auto?: string, ph?: string) => (
    <Field id={k} label={label} error={errors[k]}>
      <input id={k} type={type} autoComplete={auto} className={inputCls} value={form[k] ?? ""} onChange={set(k)} aria-invalid={!!errors[k]} placeholder={ph} />
    </Field>
  );

  return (
    <AuthShell muted="Create your" title="Library Account" compact>
      <form onSubmit={submit} noValidate className="space-y-4">
        {f("fullName", "Full name", "text", "name", "Ayesha Rahman")}
        {f("email", "Email", "email", "email", "you@university.edu")}
        <div className="grid grid-cols-2 gap-3">
          {f("password", "Password", "password", "new-password")}
          {f("confirm", "Confirm password", "password", "new-password")}
        </div>
        <details className="rounded-2xl bg-card p-4 shadow-soft">
          <summary className="cursor-pointer text-sm font-semibold">University details (optional)</summary>
          <div className="mt-4 space-y-3">
            {f("universityId", "University ID", "text", "off", "e.g. 2021-1-60-001")}
            <div className="grid grid-cols-2 gap-3">
              {f("department", "Department", "text", "off", "CSE")}
              {f("semester", "Semester", "text", "off", "Fall 2026")}
            </div>
          </div>
        </details>
        <Button type="submit" variant="hero" size="xl" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </Button>
        <GoogleButton />
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-foreground hover:text-primary">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
