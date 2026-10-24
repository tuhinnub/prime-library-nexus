import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BellRing, CheckCircle2 } from "lucide-react";
import { BackButton, FloatingCover, OnboardingShell } from "@/components/layout/OnboardingShell";
import { ONBOARDED_KEY, showcaseCovers as c } from "@/lib/onboarding";

export const Route = createFileRoute("/onboarding")({
  validateSearch: (s: Record<string, unknown>) => ({ step: Number(s.step) === 3 ? 3 : 2 }),
  head: () => ({
    meta: [
      { title: "Get started — গ্রন্থাগার" },
      { name: "description", content: "Customize your library and borrow books with ease." },
      { property: "og:title", content: "Get started with গ্রন্থাগার" },
      { property: "og:description", content: "Customize your library and borrow books with ease." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { step } = Route.useSearch();
  const navigate = useNavigate();
  const finish = (to: "/register" | "/login") => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    navigate({ to });
  };

  if (step === 2)
    return (
      <OnboardingShell
        step={2}
        back={<BackButton onClick={() => navigate({ to: "/welcome" })} />}
        onSkip={() => finish("/login")}
        art={<Shelf />}
        titleMuted="Your Library"
        titleStrong="Customize"
        mutedFirst={false}
        description="Discover books from your favorite categories and build your collection."
        cta="Continue"
        onContinue={() => navigate({ to: "/onboarding", search: { step: 3 } })}
      />
    );

  return (
    <OnboardingShell
      step={3}
      back={<BackButton onClick={() => navigate({ to: "/onboarding", search: { step: 2 } })} />}
      art={<BorrowArt />}
      titleMuted="Borrow Books"
      titleStrong="With Ease"
      description="Reserve books, track due dates, and manage your library activity."
      cta="Get Started"
      onContinue={() => finish("/register")}
    />
  );
}

function Shelf() {
  const covers = [c.gatsby, c.mockingbird, c.orwell, c.sapiens, c.pragmatic];
  return (
    <div className="relative w-72">
      {/* phone-ish frame like the reference */}
      <div className="absolute -top-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-[2.5rem] border-[6px] border-ink/90 bg-card/40" />
      <div className="relative flex justify-center gap-1.5 px-6 pt-4">
        {covers.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.45 }}
            className="book-cover aspect-[2/3] w-[18%]"
          />
        ))}
      </div>
      <div className="relative -mt-14 h-24 rounded-3xl bg-primary/25 backdrop-blur-md" />
      <div className="relative -mt-6 mx-8 h-3 rounded-full bg-lime/80" />
      <div className="absolute -bottom-8 left-12 h-10 w-0.5 bg-bluegray" />
      <div className="absolute -bottom-8 right-12 h-10 w-0.5 bg-bluegray" />
    </div>
  );
}

function BorrowArt() {
  return (
    <div className="relative h-72 w-72">
      <FloatingCover src={c.algorithms} alt="" delay={0.1} className="left-2 top-2 w-20 -rotate-12 opacity-90" />
      <FloatingCover src={c.zero} alt="" delay={0.3} className="right-2 top-10 w-20 rotate-12 opacity-90" />
      <FloatingCover src={c.deepWork} alt="" delay={0.5} className="bottom-0 left-10 w-16 rotate-6 opacity-80" />
      <span className="absolute right-10 bottom-6 size-6 rounded-full bg-lime shadow-soft" />
      <span className="absolute left-24 top-0 size-3 rounded-full bg-primary" />
      <span className="absolute right-24 bottom-16 size-2 rounded-full bg-bluegray" />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 top-1/2 flex w-64 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-2xl bg-card p-4 shadow-float"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
          <BellRing className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Book Available</p>
          <p className="text-xs text-muted-foreground">Your requested book is ready.</p>
        </div>
        <CheckCircle2 className="size-6 shrink-0 fill-lime text-ink" />
      </motion.div>
    </div>
  );
}
