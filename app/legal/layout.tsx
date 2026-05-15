import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--bg-deep)] px-4 pb-16 pt-8 text-[var(--text-primary)] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 font-display text-xs uppercase tracking-[0.2em] text-[var(--gold-mid)]">
          <Link href="/landing" className="hover:text-[var(--gold-bright)]">
            ← {SITE_NAME}
          </Link>
        </p>
        {children}
      </div>
    </div>
  );
}
