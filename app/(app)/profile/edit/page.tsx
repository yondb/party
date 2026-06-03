import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileEditForm } from "./ProfileEditForm";
import { pageHeaderUi, profileEditUi } from "@/lib/i18n-ui";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (!profile) redirect("/auth");

  const t = profileEditUi();
  const back = pageHeaderUi();

  return (<div className="pb-6">
      <PageHeader title={t.pageTitle} backHref="/profile" backLabel={back.back} />
      <ProfileEditForm
        initialName={profile.name}
        initialBio={profile.bio}
        initialGender={profile.gender === "male" ? "male" : "female"}
        initialBirthDate={profile.birth_date ?? "2000-01-01"}
        initialAvatarUrl={profile.avatar_url}
      />
    </div>
  );
}
