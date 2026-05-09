import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PartyFinder",
    short_name: "PartyFinder",
    description: "Find your party. Live the adventure.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0806",
    theme_color: "#c9963a",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
