import { AuthForm } from "./AuthForm";
import { Logo } from "@/components/ui/Logo";
import { SITE_TAGLINE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  return (<div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-page)] px-4 py-10">
      <div className="floating-card w-full max-w-md p-8" style={{ boxShadow: "var(--shadow-float)" }}>
        <div className="mb-6 flex justify-center">
          <Logo size="lg" href="" />
        </div>
        <p className="text-center text-lg font-medium text-[var(--text-secondary)]">{SITE_TAGLINE}</p>
        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          Sign in and join quests near you.
        </p>
        <AuthForm />
      </div>
    </div>
  );
}
