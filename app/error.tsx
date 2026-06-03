"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (<main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div className="max-w-md space-y-4">
        <p className="font-mono text-body-sm uppercase tracking-widest text-ash-400">Error</p>
        <h1 className="font-display text-display-2xl text-ash-900">Something went wrong</h1>
        <p className="text-body text-ash-500">
          Try again. If the problem persists, refresh the page.
        </p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-graphite px-5 py-2.5 text-body-sm font-medium text-surface transition hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
