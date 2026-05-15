"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE_NAME } from "@/lib/site";

export function SplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    try {
      const launched = window.localStorage.getItem("hasLaunched");
      if (!launched) {
        setShowSplash(true);
        window.localStorage.setItem("hasLaunched", "1");
        const t = window.setTimeout(() => {
          setShowSplash(false);
        }, 1500);
        return () => window.clearTimeout(t);
      }
    } catch {
      // localStorage may be unavailable in some embedded/privacy contexts
      setShowSplash(false);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash ? (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-void)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="text-center"
            >
              <h1
                className="font-display text-4xl font-black tracking-tight text-[var(--gold-bright)] sm:text-5xl"
                style={{ textShadow: "0 0 20px rgba(240,192,64,0.25)" }}
              >
                {SITE_NAME}
              </h1>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {children}
    </>
  );
}
