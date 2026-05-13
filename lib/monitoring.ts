/**
 * Optional error reporting hook. Wire to Sentry or another provider in production.
 */
export function logServerError(scope: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (process.env.NODE_ENV === "development") {
    console.error(`[${scope}]`, err);
    return;
  }
  console.error(`[${scope}]`, msg);
}
