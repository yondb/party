"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

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
      setShowSplash(false);
    }
  }, []);

  return (<>
      <AnimatePresence>
        {showSplash ? (<motion.div
            key="splash"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-page)]"
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
              <Logo size="lg" href="" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {children}
    </>
  );
}
