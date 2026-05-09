"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(form: {
  name: string;
  bio?: string | null;
  gender?: "male" | "female";
  birth_date?: string;
  avatar_url?: string | null;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("users")
    .update({
      name: form.name,
      bio: form.bio ?? null,
      gender: form.gender ?? undefined,
      birth_date: form.birth_date ?? undefined,
      avatar_url: form.avatar_url ?? null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  revalidatePath(`/profile/${user.id}`);
  return { ok: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth");
}
