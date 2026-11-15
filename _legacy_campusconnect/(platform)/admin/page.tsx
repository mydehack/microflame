import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard • CON-ED",
  description: "Platform administration, student account management, moderation, and AI engine controls.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
