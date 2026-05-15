import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} — find your party`,
  description:
    "Create or join local quests: running, coffee, sports, games, and more. Meet people nearby and level up your profile.",
  openGraph: {
    title: SITE_NAME,
    description: SITE_TAGLINE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
