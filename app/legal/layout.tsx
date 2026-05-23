import { Logo } from "@/components/ui/Logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--bg-page)] px-4 pb-16 pt-8 text-[var(--text-primary)] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Logo size="sm" href="/landing" />
        </div>
        {children}
      </div>
    </div>
  );
}
