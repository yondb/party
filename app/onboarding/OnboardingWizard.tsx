"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { onboardingNavUi, onboardingStepsUi } from "@/lib/i18n-ui";

const STORAGE_GOALS = "pf_onboarding_goals";
const STORAGE_CITY = "pf_onboarding_city";

export function OnboardingWizard() {
  const router = useRouter();
  const { lang } = useLanguage();
  const steps = onboardingStepsUi(lang);
  const nav = onboardingNavUi(lang);
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState("");
  const [city, setCity] = useState("");

  function finish() {
    try {
      if (goals.trim()) window.sessionStorage.setItem(STORAGE_GOALS, goals.trim());
      if (city.trim()) window.sessionStorage.setItem(STORAGE_CITY, city.trim());
    } catch {
      // noop
    }
    setLoading(true);
    router.push("/auth");
  }

  const step = steps[i] ?? steps[0];

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
          <h1 className="font-display text-2xl font-bold text-[var(--text-bright)]">{step.title}</h1>
          <p className="mt-3 text-[var(--text-secondary)]">{step.body}</p>
          {i === 3 ? (
            <textarea
              className="input-wow mt-4 min-h-[5rem] w-full resize-y rounded-md border border-[var(--gold-dim)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)]"
              placeholder={nav.goalPlaceholder}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          ) : null}
          {i === 4 ? (
            <input
              type="text"
              className="input-wow mt-4 w-full rounded-md border border-[var(--gold-dim)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)]"
              placeholder={nav.cityPlaceholder}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex gap-2">
        {i > 0 ? (
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setI((x) => x - 1)}>
            {nav.back}
          </Button>
        ) : (
          <span className="flex-1" />
        )}
        {i < steps.length - 1 ? (
          <Button type="button" variant="primary" className="flex-1" onClick={() => setI((x) => x + 1)}>
            {nav.next}
          </Button>
        ) : (
          <Button type="button" variant="primary" className="flex-1" disabled={loading} onClick={finish}>
            {loading ? nav.busy : nav.finish}
          </Button>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-[var(--text-muted)]">{nav.step(i, steps.length)}</p>
    </div>
  );
}
