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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const name = form.name.trim().slice(0, 80);
  if (!name) return { error: "Name is required" };
  const bio = form.bio?.trim().slice(0, 2000) || null;

  let birth_date: string | undefined = undefined;
  if (form.birth_date) {
    if (Number.isNaN(Date.parse(form.birth_date))) return { error: "Invalid date" };
    birth_date = form.birth_date;
  }

  let avatar_url: string | null = null;
  if (form.avatar_url) {
    const url = form.avatar_url.trim();
    if (!/^https?:\/\//i.test(url) || url.length > 1000) return { error: "Invalid avatar URL" };
    avatar_url = url;
  }

  const { error } = await supabase
    .from("users")
    .update({
      name,
      bio,
      gender: form.gender ?? undefined,
      birth_date,
      avatar_url,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  revalidatePath(`/profile/${user.id}`);
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth");
}
