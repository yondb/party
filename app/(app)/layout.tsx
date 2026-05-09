import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
