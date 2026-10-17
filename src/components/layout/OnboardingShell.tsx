import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  step: number;
  total?: number;
  back?: ReactNode;
  onSkip?: () => void;
  art: ReactNode;
  titleMuted: string;
  titleStrong: string;
  mutedFirst?: boolean;
  description: string;
  cta: string;
  onContinue: () => void;
}

/** Shared composition for the Readly-style onboarding screens. */
export function OnboardingShell({ step, total = 3, back, onSkip, art, titleMuted, titleStrong, mutedFirst = true, description, cta, onContinue }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 aura-bg opacity-40 blur-2xl" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-8 pt-6">
        <div className="flex h-10 items-center justify-between">
          <div>{back}</div>
          {onSkip && (
            <button onClick={onSkip} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              Skip
            </button>
          )}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-1 items-center justify-center py-6"
        >
          {art}
        </motion.div>

        <div className="mb-5 flex justify-center gap-1.5" aria-label={`Step ${step} of ${total}`}>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={cn("h-1 rounded-full transition-all", i + 1 === step ? "w-5 bg-primary" : "w-1.5 bg-bluegray")} />
          ))}
        </div>

        <motion.div key={`t${step}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="text-center">
          <h1 className="title-xl">
            {mutedFirst ? (
              <>
                <span className="text-muted-foreground/70">{titleMuted}</span>
                <br />
                <span>{titleStrong}</span>
              </>
            ) : (
              <>
                <span>{titleStrong}</span>
                <br />
                <span className="text-muted-foreground/70">{titleMuted}</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-3 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">{description}</p>
        </motion.div>

        <div className="mt-8 space-y-4">
          <Button variant="hero" size="xl" onClick={onContinue}>
            {cta} <ChevronRight className="!size-5" />
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-foreground hover:text-primary">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Back" className="grid size-9 place-items-center rounded-full bg-ink text-primary-foreground">
      <ArrowLeft className="size-4" />
    </button>
  );
}

export function FloatingCover({ src, className, delay = 0, alt }: { src: string; className?: string; delay?: number; alt: string }) {
  return (
    <motion.img
      src={src}
      alt={alt}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -6, 0] }}
      transition={{ opacity: { duration: 0.5, delay }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay } }}
      className={cn("book-cover absolute aspect-[2/3]", className)}
    />
  );
}
