import { Logo } from "@/components/ui/Logo";

export function LandingTopBar() {
  return (<header className="flex items-center justify-between px-5 py-4">
      <Logo size="md" href="/landing" />
    </header>
  );
}
