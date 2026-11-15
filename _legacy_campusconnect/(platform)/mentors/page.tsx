import type { Metadata } from "next";
import { MentorsDirectory } from "@/components/mentors-view";

export const metadata: Metadata = { title: "AI mentors" };
export default function MentorsPage() { return <MentorsDirectory />; }
