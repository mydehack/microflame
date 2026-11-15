import type { Metadata } from "next";
import { ProjectsView } from "@/components/projects-view";

export const metadata: Metadata = {
  title: "Projects & Opportunities • CON-ED",
  description: "Explore student engineering projects, find hackathon teammates, and discover verified internships and fellowships.",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
