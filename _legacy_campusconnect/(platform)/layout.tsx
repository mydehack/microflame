import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getActiveSessionProfile } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export default async function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getActiveSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}
