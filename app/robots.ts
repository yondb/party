import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().toString().replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/landing", "/legal", "/map", "/places", "/invite"],
      disallow: [
        "/feed",
        "/profile",
        "/notifications",
        "/settings",
        "/slots",
        "/admin",
        "/auth",
        "/setup",
        "/onboarding",
        "/api",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
