"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Code2,
  ExternalLink,
  Github,
  Heart,
  Plus,
  Search,
  Sparkles,
  Users2,
  Calendar,
  DollarSign,
  MapPin,
  Filter,
  CheckCircle2,
  X,
  Share2
} from "lucide-react";
import { ConEdStore, type ProjectShowcase, type Opportunity } from "@/lib/coned-store";

export function ProjectsView() {
  const [activeTab, setActiveTab] = useState<"projects" | "opportunities">("projects");
  const [projects, setProjects] = useState<ProjectShowcase[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [oppTypeFilter, setOppTypeFilter] = useState<string>("all");

  // Create Project Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTech, setNewTech] = useState("");
  const [newGithub, setNewGithub] = useState("");
  const [newDemo, setNewDemo] = useState("");
  const [newStatus, setNewStatus] = useState<"In Progress" | "Completed" | "Seeking Collaborators">("Seeking Collaborators");
  const [newCover, setNewCover] = useState("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80");

  useEffect(() => {
    setProjects(ConEdStore.getProjects());
    setOpportunities(ConEdStore.getOpportunities());
  }, []);

  const handleLikeProject = (projId: string) => {
    const updated = projects.map((p) => {
      if (p.id === projId) {
        const nextLiked = !p.isLiked;
        return {
          ...p,
          isLiked: nextLiked,
          likesCount: p.likesCount + (nextLiked ? 1 : -1),
        };
      }
      return p;
    });
    setProjects(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("coned_projects", JSON.stringify(updated));
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const stack = newTech
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const created = ConEdStore.addProject({
      title: newTitle.trim(),
      description: newDesc.trim(),
      coverUrl: newCover,
      techStack: stack.length > 0 ? stack : ["React", "TypeScript", "Node.js"],
      githubUrl: newGithub.trim() || undefined,
      demoUrl: newDemo.trim() || undefined,
      status: newStatus,
    });

    setProjects([created, ...projects]);
    setShowCreateModal(false);
    setNewTitle("");
    setNewDesc("");
    setNewTech("");
    setNewGithub("");
    setNewDemo("");
  };

  const allTechStacks = Array.from(
    new Set(projects.flatMap((p) => p.techStack))
  ).slice(0, 8);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTech = selectedTech === "all" || p.techStack.includes(selectedTech);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesTech && matchesStatus;
  });

  const filteredOpportunities = opportunities.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = oppTypeFilter === "all" || o.type === oppTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen pb-24 text-[#F4FFF9]">
      {/* Header */}
      <div className="border-b border-[#23372D] bg-[#080F0D]/80 backdrop-blur-md px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#00E69A] mb-1">
              <Sparkles size={15} />
              Pillar 2 & 4 — Discover & Share
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F4FFF9]">
              Showcase & Opportunities
            </h1>
            <p className="text-sm text-[#A6B8AE] mt-1 max-w-2xl">
              Discover real student-built software, find technical co-founders, and explore verified hackathons, fellowships, and internships.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 shadow-[0_0_20px_rgba(0,230,154,0.3)] transition"
            >
              <Plus size={16} />
              Showcase Project
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-6 space-y-6">
        {/* Main Tabs */}
        <div className="flex items-center justify-between border-b border-[#23372D] pb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 transition ${
                activeTab === "projects"
                  ? "text-[#00E69A] border-[#00E69A]"
                  : "text-[#71857A] border-transparent hover:text-[#A6B8AE]"
              }`}
            >
              <Code2 size={16} />
              Student Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 transition ${
                activeTab === "opportunities"
                  ? "text-[#00E69A] border-[#00E69A]"
                  : "text-[#71857A] border-transparent hover:text-[#A6B8AE]"
              }`}
            >
              <Briefcase size={16} />
              Opportunities & Internships ({opportunities.length})
            </button>
          </div>

          <div className="text-xs text-[#71857A] hidden sm:block">
            {activeTab === "projects"
              ? "Peer review & find collaborators"
              : "Verified grants, hackathons & jobs"}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71857A]" />
            <input
              type="text"
              placeholder={
                activeTab === "projects"
                  ? "Search projects, technologies (e.g. PyTorch, Rust, Next.js)..."
                  : "Search opportunities, companies (e.g. Google, OpenAI, Hackathon)..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#101916] border border-[#23372D] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00D995]"
            />
          </div>

          {activeTab === "projects" ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#101916] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
              >
                <option value="all">All Statuses</option>
                <option value="Seeking Collaborators">Seeking Collaborators</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="bg-[#101916] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
              >
                <option value="all">All Tech Stacks</option>
                {allTechStacks.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={oppTypeFilter}
                onChange={(e) => setOppTypeFilter(e.target.value)}
                className="bg-[#101916] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
              >
                <option value="all">All Opportunity Types</option>
                <option value="Internship">Internship</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Competition">Competition</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Student Projects Grid */}
        {activeTab === "projects" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-[#101916] border border-[#23372D] hover:border-[#00D995]/50 overflow-hidden flex flex-col transition-all duration-300 group shadow-lg"
              >
                {/* Cover Image */}
                <div className="relative h-44 w-full bg-[#080F0D] overflow-hidden">
                  <img
                    src={p.coverUrl}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101916] via-transparent to-black/30" />
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md ${
                      p.status === "Seeking Collaborators"
                        ? "bg-[#00E69A]/20 text-[#00E69A] border-[#00E69A]/40 animate-pulse"
                        : p.status === "Completed"
                        ? "bg-[#4DA9FF]/20 text-[#4DA9FF] border-[#4DA9FF]/40"
                        : "bg-[#FFC15A]/20 text-[#FFC15A] border-[#FFC15A]/40"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Author Bar */}
                    <div className="flex items-center gap-2">
                      <img
                        src={p.authorAvatar}
                        alt={p.authorName}
                        className="w-6 h-6 rounded-full object-cover border border-[#00D995]/40"
                      />
                      <span className="text-xs text-[#A6B8AE] font-medium">{p.authorName}</span>
                      <span className="text-[10px] text-[#71857A]">• {p.createdAt}</span>
                    </div>

                    <h3 className="text-lg font-bold text-[#F4FFF9] group-hover:text-[#00E69A] transition leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[#A6B8AE] line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Tech stack pills */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#18251F] text-[#67F5B8] border border-[#23372D]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#23372D]/60">
                      <button
                        onClick={() => handleLikeProject(p.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                          p.isLiked ? "text-[#FF5364]" : "text-[#71857A] hover:text-[#F4FFF9]"
                        }`}
                      >
                        <Heart size={14} className={p.isLiked ? "fill-[#FF5364]" : ""} />
                        <span>{p.likesCount}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {p.githubUrl && (
                          <a
                            href={p.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-[#71857A] hover:text-[#F4FFF9] hover:bg-[#18251F] transition"
                            title="GitHub Repository"
                          >
                            <Github size={15} />
                          </a>
                        )}
                        {p.demoUrl && (
                          <a
                            href={p.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#00E69A] bg-[#18251F] hover:bg-[#00E69A] hover:text-[#050908] transition"
                          >
                            <ExternalLink size={12} />
                            Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Opportunities Board */}
        {activeTab === "opportunities" && (
          <div className="space-y-4 pt-2">
            {filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="rounded-2xl bg-[#101916] border border-[#23372D] hover:border-[#00D995]/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition shadow-lg group"
              >
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={opp.logoUrl}
                    alt={opp.organization}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#23372D] shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#18251F] text-[#00E69A] border border-[#23372D]">
                        {opp.type}
                      </span>
                      <span className="text-xs text-[#71857A] font-medium">{opp.organization}</span>
                      <span className="text-xs text-[#71857A] flex items-center gap-1">
                        <MapPin size={12} /> {opp.location}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#F4FFF9] group-hover:text-[#00E69A] transition">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-[#A6B8AE] max-w-2xl leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {opp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-[#71857A] bg-[#080F0D] px-2 py-0.5 rounded-md border border-[#23372D]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#23372D]">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-[#67F5B8] block">
                      {opp.rewardOrStipend}
                    </span>
                    <span className="text-[10px] text-[#71857A] flex items-center gap-1">
                      <Calendar size={11} /> Deadline: {opp.deadline}
                    </span>
                  </div>

                  <a
                    href={opp.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#050908] bg-[#00E69A] hover:bg-[#00C982] transition"
                  >
                    Apply Now
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Project */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101916] border border-[#23372D] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-[#71857A] hover:text-[#F4FFF9]"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-[#F4FFF9] flex items-center gap-2">
              <Code2 size={20} className="text-[#00E69A]" />
              Showcase Your Project
            </h3>
            <p className="text-xs text-[#A6B8AE] mt-1 mb-5">
              Highlight your work to fellow students, recruiters, and prospective collaborators.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Vector RAG Engine"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-sm text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain what the project does, challenges solved, and architecture..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    Technologies (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Next.js, PyTorch, Docker"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  >
                    <option value="Seeking Collaborators">Seeking Collaborators</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    GitHub URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={newGithub}
                    onChange={(e) => setNewGithub(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    Demo URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newDemo}
                    onChange={(e) => setNewDemo(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A6B8AE] hover:text-[#F4FFF9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-[#00E69A] hover:bg-[#00C982] transition"
                >
                  Publish to Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
