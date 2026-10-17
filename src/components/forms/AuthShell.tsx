import type { ReactNode } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { showcaseCovers as c } from "@/lib/onboarding";

export function BookCollage({ compact }: { compact?: boolean }) {
  const items = [
    { src: c.gatsby, cls: "left-0 top-10 w-[30%] -rotate-6" },
    { src: c.mockingbird, cls: "left-[8%] top-[45%] w-[30%] rotate-3" },
    { src: c.pragmatic, cls: "left-[30%] top-0 w-[28%] -rotate-2" },
    { src: c.sapiens, cls: "right-[4%] top-4 w-[30%] rotate-6" },
    { src: c.orwell, cls: "left-[36%] top-[40%] w-[30%] -rotate-3 z-10" },
    { src: c.atomicHabits, cls: "right-0 top-[42%] w-[30%] rotate-2" },
  ];
  return (
    <div className={compact ? "relative mx-auto h-44 w-60" : "relative mx-auto h-64 w-72"}>
      {items.map((it, i) => (
        <motion.img
          key={it.src}
          src={it.src}
          alt=""
          initial={{ opacity: 0, y: 18, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`book-cover absolute aspect-[2/3] ${it.cls}`}
        />
      ))}
    </div>
  );
}

export function AuthShell({ title, muted, children, compact }: { title: string; muted: string; children: ReactNode; compact?: boolean }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 aura-bg opacity-30 blur-3xl" />
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <BookCollage compact={compact} />
        <h1 className="title-xl mt-8 text-center">
          <span className="text-muted-foreground/70">{muted}</span>
          <br />
          {title}
        </h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <Button
      type="button"
      variant="soft"
      size="xl"
      onClick={async () => {
        const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
        if (res.error) toast.error(res.error.message ?? "Google sign-in failed");
      }}
    >
      <svg viewBox="0 0 24 24" className="!size-5" aria-hidden>
        <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8.1z" />
        <path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.6l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.8 14.3a6.6 6.6 0 0 1 0-4.2V7.3H2.2a11 11 0 0 0 0 9.8l3.6-2.8z" />
        <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.3l3.6 2.8C6.7 7.4 9.1 5.4 12 5.4z" />
      </svg>
      {label}
    </Button>
  );
}

export function Field({ label, error, children, id }: { label: string; error?: string; children: ReactNode; id: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputCls =
  "h-12 w-full rounded-2xl border bg-card px-4 text-sm shadow-soft outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20";
