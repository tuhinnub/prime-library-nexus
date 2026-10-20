import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BottomNavigation, DesktopNavigation, UserHeader } from "@/components/navigation/nav";
import { useRouterState } from "@tanstack/react-router";

export function AppLayout({ children }: { children: ReactNode }) {
  const inManagement = useRouterState({ select: s => s.location.pathname.startsWith('/admin') });
  if (inManagement) return <>{children}</>;
  return (
    <div className="min-h-screen bg-background">
      <DesktopNavigation />
      <UserHeader />
      <main className="mx-auto max-w-6xl px-5 pb-32 pt-6 md:px-6 md:pb-16 md:pt-10">{children}</main>
      <BottomNavigation />
    </div>
  );
}

/** Fade/slide used for every page body. */
export function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>}
        <h1 className="title-lg sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
