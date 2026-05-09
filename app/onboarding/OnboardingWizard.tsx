"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    title: "Quests in real life",
    body: "PartyFinder matches people for spontaneous activities: running, coffee, volleyball, board games, and more.",
  },
  {
    title: "Build your party",
    body: "Hosts review applications and accept the final lineup, just like a party finder in MMORPGs.",
  },
  {
    title: "Gain EXP for showing up",
    body: "Complete activities, get rated, and level up your real-life adventurer profile.",
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(false);

  function finish() {
    setLoading(true);
    router.push("/auth");
  }

  return (
    <div className="wow-card w-full max-w-md rounded-lg p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="font-display text-2xl font-bold text-[var(--text-bright)]">
            {steps[i].title}
          </h1>
          <p className="mt-3 text-[var(--text-secondary)]">{steps[i].body}</p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex gap-2">
        {i > 0 ? (
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setI((x) => x - 1)}>
            Back
          </Button>
        ) : (
          <span className="flex-1" />
        )}
        {i < steps.length - 1 ? (
          <Button type="button" variant="primary" className="flex-1" onClick={() => setI((x) => x + 1)}>
            Next
          </Button>
        ) : (
          <Button type="button" variant="primary" className="flex-1" disabled={loading} onClick={finish}>
            {loading ? "..." : "Start in 30 seconds"}
          </Button>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
        Step {i + 1} / {steps.length}
      </p>
    </div>
  );
}
