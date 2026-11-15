import { ProfileView } from "@/components/profile-view";
import { getActiveSessionProfile } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export default async function OwnProfilePage() {
  const profile = await getActiveSessionProfile();

  return <ProfileView initialProfile={profile || undefined} isOwnProfile={true} />;
}
