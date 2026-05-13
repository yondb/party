import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PartyFinder — find your party",
  description:
    "Create or join local quests: running, coffee, sports, games, and more. Meet people nearby and level up your profile.",
  openGraph: {
    title: "PartyFinder",
    description: "Find your party. Live the adventure.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PartyFinder",
    description: "Find your party. Live the adventure.",
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
