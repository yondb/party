import { AuthForm } from "./AuthForm";
import { Logo } from "@/components/ui/Logo";
import { SITE_TAGLINE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-page)] px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" href="" />
        </div>
        <p className="text-center text-base text-[var(--text-secondary)]">{SITE_TAGLINE}</p>
        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          Email/password authentication enabled (temporary replacement for SMS OTP).
        </p>
        <AuthForm />
      </div>
    </div>
  );
}
