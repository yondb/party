import Link from "next/link";

export default function NotFound() {
  return (<main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div className="max-w-md space-y-4">
        <p className="font-mono text-body-sm uppercase tracking-widest text-ash-400">404</p>
        <h1 className="font-display text-display-2xl text-ash-900">Page not found</h1>
        <p className="text-body text-ash-500">
          This page does not exist or has moved.
        </p>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 rounded-full bg-graphite px-5 py-2.5 text-body-sm font-medium text-surface transition hover:opacity-90"
        >
          Back to map
        </Link>
      </div>
    </main>
  );
}
