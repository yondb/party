import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/map");

  const setupDone = user.user_metadata?.setup_done === true;
  if (!setupDone) redirect("/setup");

  redirect("/map");
}
