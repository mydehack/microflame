import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProfileView } from "@/components/profile-view";
import { ConEdStore } from "@/lib/coned-store";
import { getActiveSessionProfile } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} · Student Profile` };
}

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const currentSession = await getActiveSessionProfile();

  const allStudents = ConEdStore.getStudents();
  const student = allStudents.find(
    (s) => s.username.toLowerCase() === username.toLowerCase()
  );

  // If viewing own username
  const isOwn =
    currentSession?.username.toLowerCase() === username.toLowerCase() ||
    username === "alex_rivera";

  if (!student && !isOwn) {
    // If not found in store, create a dynamic student profile for that username
    const dynamicProfile = {
      ...ConEdStore.getCurrentUser(),
      id: `usr_${username}`,
      username: username,
      fullName: username
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      college: "Stanford University",
      department: "Computer Science",
      bio: `Student on CON-ED studying Computer Science & Artificial Intelligence.`,
    };
    return <ProfileView initialProfile={dynamicProfile} isOwnProfile={false} />;
  }

  const targetProfile = isOwn ? currentSession || student : student;

  return (
    <ProfileView
      initialProfile={targetProfile || undefined}
      isOwnProfile={isOwn}
    />
  );
}
