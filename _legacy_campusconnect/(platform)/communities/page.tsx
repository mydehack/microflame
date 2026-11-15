import type { Metadata } from "next";
import { CommunitiesView } from "@/components/communities-view";
export const metadata: Metadata = { title: "Communities" };
export default function CommunitiesPage() { return <CommunitiesView />; }
