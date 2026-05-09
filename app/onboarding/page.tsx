import { OnboardingWizard } from "./OnboardingWizard";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <OnboardingWizard />
    </div>
  );
}
