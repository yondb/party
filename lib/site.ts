/** Brand in nav, auth, splash, manifest, metadata — matches lfparty.com */
export const SITE_NAME = "lfparty";

export const SITE_TAGLINE = "Find your party. Live the adventure.";

/** Default support address when `NEXT_PUBLIC_SUPPORT_EMAIL` is unset */
export const DEFAULT_SUPPORT_EMAIL = "support@lfparty.com";

/**
 * Canonical URL for `metadataBase` (Open Graph, absolute links).
 * Production: set `NEXT_PUBLIC_SITE_URL=https://lfparty.com` in Vercel.
 */
export function getSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    const u = raw.replace(/\/$/, "");
    return new URL(u.startsWith("http") ? u : `https://${u}`);
  }
  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);
  return new URL("http://localhost:3000");
}
