import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileEditForm } from "./ProfileEditForm";
import { getServerLang } from "@/lib/i18n-server";
import { pageHeaderUi, profileEditUi } from "@/lib/i18n-ui";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (!profile) redirect("/auth");

  const lang = getServerLang();
  const t = profileEditUi(lang);
  const back = pageHeaderUi(lang);

  return (
    <div className="pb-6">
      <PageHeader title={t.pageTitle} backHref="/profile" backLabel={back.back} />
      <ProfileEditForm
        lang={lang}
        initialName={profile.name}
        initialBio={profile.bio}
        initialGender={profile.gender === "male" ? "male" : "female"}
        initialBirthDate={profile.birth_date ?? "2000-01-01"}
        initialAvatarUrl={profile.avatar_url}
      />
    </div>
  );
}
