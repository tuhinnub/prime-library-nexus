import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { ONBOARDED_KEY } from "@/lib/onboarding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Library — Discover, borrow & explore books" },
      { name: "description", content: "A beautiful smart library for students and faculty: discover, reserve and track books." },
      { property: "og:title", content: "Smart Library" },
      { property: "og:description", content: "Discover, borrow and explore books in one smart library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) return navigate({ to: "/dashboard", replace: true });
      const seen = localStorage.getItem(ONBOARDED_KEY);
      navigate({ to: seen ? "/login" : "/welcome", replace: true });
    }, 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] aura-bg blur-3xl" />
      <motion.h1
        initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-3xl font-extrabold tracking-tight sm:text-4xl"
      >
        Smart Library
      </motion.h1>
    </main>
  );
}
