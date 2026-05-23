import { signOut } from "@/app/actions/profile";

export const dynamic = "force-dynamic";

export default function BannedPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12 text-center">
      <h1 className="text-2xl font-bold font-bold text-[var(--status-full)]">Konto zawieszone</h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
        To konto zostało zablokowane przez moderatora. Jeśli uważasz, że to pomyłka, skontaktuj się z pomocą techniczną
        (np. przez kanał, którym się rejestrowałeś).
      </p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        This account has been suspended by a moderator. Contact support if you believe this is an error.
      </p>
      <form className="mt-8" action={signOut}>
        <button
          type="submit"
          className="btn-secondary inline-flex min-h-[3rem] w-full items-center justify-center rounded-md px-4 py-3 text-sm font-medium"
        >
          Wyloguj
        </button>
      </form>
    </div>
  );
}
