import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FloatingCover, OnboardingShell } from "@/components/layout/OnboardingShell";
import { ONBOARDED_KEY, showcaseCovers as c } from "@/lib/onboarding";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — গ্রন্থাগার" },
      { name: "description", content: "Discover, borrow, and explore books in one smart library." },
      { property: "og:title", content: "Welcome to গ্রন্থাগার" },
      { property: "og:description", content: "Discover, borrow, and explore books in one smart library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const skip = () => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    navigate({ to: "/login" });
  };
  return (
    <OnboardingShell
      step={1}
      onSkip={skip}
      art={
        <div className="relative h-72 w-64">
          <FloatingCover src={c.deepWork} alt="Deep Work" delay={0.2} className="left-20 top-4 w-36 rotate-[10deg]" />
          <FloatingCover src={c.cleanCode} alt="Clean Code" delay={0.35} className="left-2 top-14 w-36 -rotate-[8deg]" />
          <FloatingCover src={c.atomicHabits} alt="Atomic Habits" delay={0.1} className="left-12 top-0 w-40 rotate-[3deg] shadow-float" />
        </div>
      }
      titleMuted="Welcome"
      titleStrong="to গ্রন্থাগার"
      description="Discover, borrow, and explore books in one smart library."
      cta="Continue"
      onContinue={() => navigate({ to: "/onboarding", search: { step: 2 } })}
    />
  );
}
