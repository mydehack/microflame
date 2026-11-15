import type { Metadata } from "next";
import { GoalsView } from "@/components/goals-view";

export const metadata: Metadata = { title: "Goals & progress" };
export default function GoalsPage() { return <GoalsView />; }
