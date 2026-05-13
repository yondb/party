import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
