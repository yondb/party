// Back-compat barrel — prefer `@/lib/supabase/client` or `@/lib/supabase/server`.
export { createClient as createBrowserClient } from "./supabase/client";
export { createClient as createServerClient } from "./supabase/server";
