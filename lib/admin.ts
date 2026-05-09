/** Comma-separated list in ADMIN_EMAILS (e.g. you@domain.com,other@domain.com). */
export function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function parseAdminUserIds(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = parseAdminEmails(process.env.ADMIN_EMAILS);
  return list.includes(email.trim().toLowerCase());
}

/** True if this user may open /admin (email allowlist and/or user id allowlist). */
export function isAdminUser(user: { id: string; email?: string | null } | null | undefined): boolean {
  if (!user) return false;
  const ids = parseAdminUserIds(process.env.ADMIN_USER_IDS);
  if (ids.includes(user.id)) return true;
  return isAdminEmail(user.email);
}
