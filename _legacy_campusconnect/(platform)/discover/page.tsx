import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverView } from "@/components/discover-view";

export const metadata: Metadata = { title: "Discover students" };
export default function DiscoverPage() { return <Suspense><DiscoverView /></Suspense>; }
