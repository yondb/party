import { AuthForm } from "./AuthForm";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div
        className="wow-card relative w-full max-w-md rounded-lg p-8"
        style={{
          boxShadow:
            "0 0 0 1px var(--gold-dim), 0 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(240,192,64,0.06)",
        }}
      >
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold-dark)] to-transparent" />
        <h1
          className="text-center font-display text-4xl font-bold text-[var(--gold-bright)]"
          style={{ textShadow: "0 0 24px rgba(240,192,64,0.25)" }}
        >
          PartyFinder
        </h1>
        <p className="mt-2 text-center font-body text-lg italic text-[var(--text-primary)]">
          Find your party. Live the adventure.
        </p>
        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          Email/password authentication enabled (temporary replacement for SMS OTP).
        </p>
        <AuthForm />
      </div>
    </div>
  );
}
