"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Heart,
  Bookmark,
  UserPlus,
  BadgeCheck,
  X,
  Code2,
  FolderGit2,
  Building,
  GraduationCap,
} from "lucide-react";
import { ConEdStore, type StudentProfile } from "@/lib/coned-store";

export interface DiscoverItem {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorCollege: string;
  authorAvatar: string;
  authorUsername: string;
  imageUrl?: string;
  tags: string[];
  likesCount: number;
  description: string;
  type: "Project" | "Research" | "Discussion" | "Code";
  aspect: "tall" | "standard" | "wide";
}

export const DISCOVER_ITEMS: DiscoverItem[] = [
  {
    id: "disc_1",
    title: "Autonomous Drone Swarm with ROS2 & Spatial Obstacle Avoidance",
    category: "AI",
    authorName: "Marcus Chen",
    authorCollege: "UC Berkeley",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    authorUsername: "marcus_chen",
    imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    tags: ["ROS2", "Robotics", "C++", "OpenCV"],
    likesCount: 184,
    description: "Open-source decentralized flight swarm simulation tested in Gazebo with ultra-wideband localization modules.",
    type: "Project",
    aspect: "tall",
  },
  {
    id: "disc_2",
    title: "Graph Attention Network for Molecule Property Prediction",
    category: "Technology",
    authorName: "Priya Sharma",
    authorCollege: "MIT",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    authorUsername: "priya_sharma",
    imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
    tags: ["PyTorch", "GraphAI", "BioTech"],
    likesCount: 220,
    description: "Presented at NeurIPS Student Workshop. Benchmark testing biochemical solubility and cellular permeability.",
    type: "Research",
    aspect: "standard",
  },
  {
    id: "disc_3",
    title: "CON-ED Emerald Design System & Glassmorphic Component Tokens",
    category: "Design",
    authorName: "Aisha Patel",
    authorCollege: "Stanford University",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
    authorUsername: "aisha_patel",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    tags: ["UIUX", "DesignTokens", "Figma", "TailwindCSS"],
    likesCount: 310,
    description: "Complete design kit with high-contrast emerald glow, accessible dark mode, and radial menus.",
    type: "Project",
    aspect: "tall",
  },
  {
    id: "disc_4",
    title: "Zero-Knowledge Cryptography Library Implemented in Pure Rust",
    category: "Programming",
    authorName: "Liam O'Connor",
    authorCollege: "Oxford University",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    authorUsername: "liam_oconnor",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    tags: ["Rust", "ZKProofs", "Cryptography"],
    likesCount: 145,
    description: "High-performance zk-SNARK prover library optimized for WebAssembly runtimes and browser verification.",
    type: "Code",
    aspect: "standard",
  },
  {
    id: "disc_5",
    title: "AWS Cloud Infrastructure Hardening & Automated Penetration Testing",
    category: "Career",
    authorName: "Elena Rostova",
    authorCollege: "Georgia Tech",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
    authorUsername: "elena_rostova",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    tags: ["Cybersecurity", "Cloud", "AWS"],
    likesCount: 198,
    description: "Collegiate Cyber Defense competition architecture blueprint for resilient microservices infrastructure.",
    type: "Project",
    aspect: "wide",
  },
  {
    id: "disc_6",
    title: "Top 7 Dynamic Programming Patterns for Placement Sprints",
    category: "Education",
    authorName: "Alex Rivera",
    authorCollege: "Stanford University",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    authorUsername: "alex_rivera",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    tags: ["DSA", "LeetCode", "PlacementPrep"],
    likesCount: 420,
    description: "Visual decision trees for 1D, 2D, and Tree DP problems with space-optimized code solutions.",
    type: "Discussion",
    aspect: "tall",
  },
  {
    id: "disc_7",
    title: "How We Scaled Our Student Startup to 10k Users with $0 Cloud Spend",
    category: "Business",
    authorName: "Arjun Mehta",
    authorCollege: "BITS Pilani",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    authorUsername: "arjun_mehta",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    tags: ["Startups", "Cloud", "Architecture"],
    likesCount: 365,
    description: "Case study leveraging Supabase free tier, Cloudflare Workers, and static ISR Next.js deployments.",
    type: "Discussion",
    aspect: "standard",
  },
  {
    id: "disc_8",
    title: "Campus Hackathon Survival Guide: Pitching, Scoping, and Winning",
    category: "College Life",
    authorName: "CON-ED AI",
    authorCollege: "CON-ED Platform",
    authorAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
    authorUsername: "coned_ai",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    tags: ["Hackathon", "StudentGuide", "Leadership"],
    likesCount: 512,
    description: "Actionable rubric used by hackathon judges and winning team strategies for fast 48-hour sprints.",
    type: "Education",
    aspect: "wide",
  },
];

const CATEGORIES = [
  "All",
  "Technology",
  "AI",
  "Programming",
  "Design",
  "Education",
  "Projects",
  "College Life",
  "Business",
  "Career",
];

export function DiscoverView() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [activeItem, setActiveItem] = useState<DiscoverItem | null>(null);

  const creators = ConEdStore.getStudents().slice(0, 5);

  const filteredItems = useMemo(() => {
    return DISCOVER_ITEMS.filter((item) => {
      // Category match
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      // College match
      if (selectedCollege !== "All" && !item.authorCollege.includes(selectedCollege)) {
        return false;
      }
      // Type match
      if (selectedType !== "All" && item.type !== selectedType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesAuthor = item.authorName.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        return matchesTitle || matchesTags || matchesAuthor || matchesDesc;
      }
      return true;
    });
  }, [selectedCategory, selectedCollege, selectedType, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101916] border border-[#00E69A]/30 text-[#00E69A] text-xs font-semibold mb-2">
            <Compass size={14} />
            <span>Discover Opportunities & Inventions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4FFF9] tracking-tight">
            Explore the Student Knowledge Graph
          </h1>
          <p className="text-xs sm:text-sm text-[#A6B8AE] mt-1">
            Browse peer research, open-source repositories, design libraries, and discussions across 400+ universities.
          </p>
        </div>

        {/* Filter Trigger Button */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-xl bg-[#101916] border border-[#23372D] hover:border-[#00E69A]/40 text-xs font-bold text-[#F4FFF9] flex items-center gap-2 transition-all w-fit cursor-pointer"
        >
          <Filter size={14} className="text-[#00E69A]" />
          <span>Filters</span>
          {(selectedCollege !== "All" || selectedType !== "All") && (
            <span className="w-2 h-2 rounded-full bg-[#00E69A]" />
          )}
        </button>
      </div>

      {/* RECOMMENDED CREATORS CAROUSEL */}
      <div className="p-4 rounded-2xl bg-[#101916] border border-[#23372D] mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-[#F4FFF9] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#00E69A]" /> Recommended Student Creators
          </span>
          <span className="text-[10px] text-[#71857A]">Ranked by Compatibility</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {creators.map((c) => (
            <Link
              key={c.id}
              href={`/profile/${c.username}`}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#131F1A] border border-[#23372D] hover:border-[#00E69A]/40 transition-all shrink-0 min-w-[210px]"
            >
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#00E69A]/40 shrink-0">
                <img src={c.avatarUrl} alt={c.fullName} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#F4FFF9] truncate">{c.fullName}</span>
                  {c.isPlatformBadge && <BadgeCheck size={12} className="text-[#00E69A]" />}
                </div>
                <span className="text-[10px] text-[#71857A] truncate">
                  {c.college} • {c.department}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FILTER DRAWER IF OPEN */}
      {showFilters && (
        <div className="p-4 rounded-2xl bg-[#131F1A] border border-[#00E69A]/30 mb-6 flex flex-wrap items-center gap-4 animate-in fade-in">
          <div>
            <label className="text-[11px] font-semibold text-[#A6B8AE] mb-1 block">
              University / College
            </label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none"
            >
              <option value="All">All Universities</option>
              <option value="Stanford">Stanford University</option>
              <option value="MIT">MIT</option>
              <option value="UC Berkeley">UC Berkeley</option>
              <option value="Oxford">Oxford University</option>
              <option value="Georgia Tech">Georgia Tech</option>
              <option value="BITS Pilani">BITS Pilani</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#A6B8AE] mb-1 block">Content Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none"
            >
              <option value="All">All Formats</option>
              <option value="Project">Projects & Demos</option>
              <option value="Research">Academic Papers</option>
              <option value="Code">Open-Source Code</option>
              <option value="Discussion">Deep Discussions</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCollege("All");
              setSelectedType("All");
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="mt-4 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#FF5364] hover:bg-[#FF5364]/10"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 9 CATEGORIES PILL BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#00E69A] text-[#050908] shadow-[0_0_15px_rgba(0,230,154,0.4)]"
                : "bg-[#101916] border border-[#23372D] text-[#A6B8AE] hover:text-[#F4FFF9] hover:border-[#00E69A]/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PINTEREST-INSPIRED RESPONSIVE MASONRY GRID */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#101916] border border-[#23372D] text-center flex flex-col items-center justify-center">
          <Search size={32} className="text-[#71857A] mb-3" />
          <h3 className="text-base font-bold text-[#F4FFF9] mb-1">No discovery cards found</h3>
          <p className="text-xs text-[#71857A] max-w-sm">
            Try adjusting your search terms, university filters, or category selection.
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="break-inside-avoid rounded-2xl bg-[#101916] border border-[#23372D] hover:border-[#00E69A]/50 hover:shadow-[0_0_20px_rgba(0,230,154,0.15)] transition-all overflow-hidden flex flex-col cursor-pointer group"
            >
              {/* Image Preview with varying heights */}
              {item.imageUrl && (
                <div
                  className={`relative w-full overflow-hidden bg-[#080F0D] ${
                    item.aspect === "tall"
                      ? "h-64"
                      : item.aspect === "wide"
                      ? "h-40"
                      : "h-52"
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#050908]/80 backdrop-blur-md border border-[#23372D] text-[10px] font-bold text-[#00E69A]">
                    {item.type}
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-4 flex flex-col gap-2.5">
                <h3 className="text-sm font-bold text-[#F4FFF9] group-hover:text-[#00E69A] transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#A6B8AE] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#131F1A] text-[10px] font-semibold text-[#67F5B8]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Card Footer Author & Likes */}
                <div className="pt-3 border-t border-[#23372D]/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-[#23372D]">
                      <img src={item.authorAvatar} alt={item.authorName} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-medium text-[#F4FFF9] truncate max-w-[110px]">
                      {item.authorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#71857A]">
                    <Heart size={13} className="text-[#00E69A]" />
                    <span>{item.likesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DISCOVER ITEM DETAIL MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#101916] border border-[#00E69A]/40 p-6 sm:p-8 flex flex-col gap-5 shadow-[0_0_50px_rgba(0,230,154,0.25)]">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#00E69A]/15 border border-[#00E69A]/40 text-xs font-bold text-[#00E69A]">
                {activeItem.category} • {activeItem.type}
              </span>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="w-8 h-8 rounded-full bg-[#18251F] text-[#F4FFF9] flex items-center justify-center hover:bg-[#23372D]"
              >
                <X size={16} />
              </button>
            </div>

            {activeItem.imageUrl && (
              <div className="w-full max-h-72 rounded-2xl overflow-hidden border border-[#23372D]">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4FFF9] leading-tight">
              {activeItem.title}
            </h2>

            <p className="text-sm text-[#A6B8AE] leading-relaxed">
              {activeItem.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {activeItem.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-[#131F1A] border border-[#23372D] text-xs font-semibold text-[#00E69A]"
                >
                  #{t}
                </span>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[#080F0D] border border-[#23372D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#00E69A]/50">
                  <img
                    src={activeItem.authorAvatar}
                    alt={activeItem.authorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F4FFF9]">{activeItem.authorName}</h4>
                  <span className="text-[10px] text-[#71857A]">{activeItem.authorCollege}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${activeItem.authorUsername}`}
                  className="px-4 py-2 rounded-xl bg-[#131F1A] border border-[#23372D] hover:border-[#00E69A] text-xs font-bold text-[#F4FFF9]"
                >
                  View Profile
                </Link>
                <Link
                  href="/messages"
                  className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Send Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
