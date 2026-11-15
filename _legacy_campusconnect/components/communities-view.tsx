"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UsersRound,
  Plus,
  Search,
  Lock,
  Globe,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Bell,
  Calendar,
  Check,
  X,
  Shield,
  BookOpen,
} from "lucide-react";
import { ConEdStore, type Community } from "@/lib/coned-store";

export function CommunitiesView() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [activeTab, setActiveTab] = useState<"discussions" | "announcements" | "events" | "members">("discussions");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New community form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Artificial Intelligence");
  const [bannerUrl, setBannerUrl] = useState("");
  const [rules, setRules] = useState(["Be respectful and collaborative", "No spam or unauthorized promotions"]);

  useEffect(() => {
    setCommunities(ConEdStore.getCommunities());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleJoin = (commId: string) => {
    const joined = ConEdStore.toggleJoinCommunity(commId);
    setCommunities(ConEdStore.getCommunities());
    if (activeCommunity?.id === commId) {
      setActiveCommunity((prev) => (prev ? { ...prev, isJoined: joined } : null));
    }
    showToast(joined ? "Joined community!" : "Left community.");
  };

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newComm = ConEdStore.createCommunity({
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: description.trim(),
      category: category,
      bannerUrl:
        bannerUrl.trim() ||
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      logoUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
      rules: rules,
    });

    setCommunities(ConEdStore.getCommunities());
    setShowCreateModal(false);
    setName("");
    setDescription("");
    showToast(`Community "${newComm.name}" created!`);
  };

  const filteredCommunities = communities.filter((c) => {
    if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#101916] border border-[#00E69A] text-[#F4FFF9] text-xs font-semibold shadow-[0_0_20px_rgba(0,230,154,0.35)] flex items-center gap-2">
          <Check size={14} className="text-[#00E69A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101916] border border-[#00E69A]/30 text-[#00E69A] text-xs font-semibold mb-2">
            <UsersRound size={14} />
            <span>Student Hubs & Study Guilds</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4FFF9] tracking-tight">
            Campus Communities
          </h1>
          <p className="text-xs sm:text-sm text-[#A6B8AE] mt-1">
            Build and join student-led study groups, hackathon crews, lab guilds, and academic interest clubs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Community</span>
        </button>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {[
            "All",
            "Artificial Intelligence",
            "Web Development",
            "Robotics & Hardware",
            "Career & Coding",
          ].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#00E69A] text-[#050908]"
                  : "bg-[#101916] border border-[#23372D] text-[#A6B8AE] hover:text-[#F4FFF9]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-[#71857A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#101916] border border-[#23372D] text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A]"
          />
        </div>
      </div>

      {/* Community Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCommunities.map((comm) => (
          <div
            key={comm.id}
            className="rounded-2xl bg-[#101916] border border-[#23372D] hover:border-[#00E69A]/50 transition-all overflow-hidden flex flex-col justify-between group shadow-sm"
          >
            {/* Top Banner */}
            <div className="relative h-28 w-full bg-[#131F1A] overflow-hidden">
              <img
                src={comm.bannerUrl}
                alt={comm.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101916] via-transparent to-transparent" />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#050908]/80 text-[10px] font-bold text-[#00E69A]">
                {comm.category}
              </div>
            </div>

            {/* Logo and Info */}
            <div className="p-5 -mt-8 relative z-10 flex flex-col flex-1 justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#00E69A]/60 bg-[#080F0D] shrink-0 shadow-md">
                  <img src={comm.logoUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3
                    onClick={() => setActiveCommunity(comm)}
                    className="text-sm font-bold text-[#F4FFF9] hover:text-[#00E69A] cursor-pointer truncate"
                  >
                    {comm.name}
                  </h3>
                  <span className="text-[11px] text-[#71857A]">
                    {comm.membersCount} members • {comm.postsCount} posts
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#A6B8AE] line-clamp-2 leading-relaxed">
                {comm.description}
              </p>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#23372D] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveCommunity(comm)}
                  className="text-xs font-semibold text-[#00E69A] hover:underline"
                >
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleJoin(comm.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    comm.isJoined
                      ? "bg-[#131F1A] border border-[#23372D] text-[#A6B8AE] hover:text-[#FF5364]"
                      : "btn-gradient"
                  }`}
                >
                  {comm.isJoined ? "Joined" : "Join Guild"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COMMUNITY DETAIL MODAL */}
      {activeCommunity && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#101916] border border-[#00E69A]/40 overflow-hidden flex flex-col shadow-2xl">
            {/* Header Banner */}
            <div className="relative h-44 w-full bg-[#131F1A]">
              <img
                src={activeCommunity.bannerUrl}
                alt=""
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101916] via-transparent to-transparent" />
              <button
                type="button"
                onClick={() => setActiveCommunity(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 sm:p-8 -mt-10 relative z-10 flex flex-col gap-5">
              <div className="flex items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#00E69A] bg-[#050908] shrink-0">
                    <img
                      src={activeCommunity.logoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#F4FFF9]">
                      {activeCommunity.name}
                    </h2>
                    <span className="text-xs text-[#00E69A]">{activeCommunity.category}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleJoin(activeCommunity.id)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCommunity.isJoined
                      ? "bg-[#131F1A] border border-[#23372D] text-[#A6B8AE]"
                      : "btn-gradient"
                  }`}
                >
                  {activeCommunity.isJoined ? "Leave Guild" : "Join Guild"}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#A6B8AE] leading-relaxed">
                {activeCommunity.description}
              </p>

              {/* Rules Box */}
              <div className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D]">
                <h4 className="text-xs font-bold text-[#F4FFF9] mb-2 flex items-center gap-1.5">
                  <Shield size={13} className="text-[#00E69A]" /> Community Guidelines
                </h4>
                <ul className="list-disc list-inside text-xs text-[#71857A] space-y-1">
                  {activeCommunity.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

              {/* Discussions & Announcements tabs */}
              <div className="flex items-center gap-3 border-b border-[#23372D] pb-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("discussions")}
                  className={`pb-1 ${
                    activeTab === "discussions"
                      ? "text-[#00E69A] border-b-2 border-[#00E69A]"
                      : "text-[#71857A]"
                  }`}
                >
                  Discussions & Posts
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("announcements")}
                  className={`pb-1 ${
                    activeTab === "announcements"
                      ? "text-[#00E69A] border-b-2 border-[#00E69A]"
                      : "text-[#71857A]"
                  }`}
                >
                  Announcements
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("events")}
                  className={`pb-1 ${
                    activeTab === "events"
                      ? "text-[#00E69A] border-b-2 border-[#00E69A]"
                      : "text-[#71857A]"
                  }`}
                >
                  Upcoming Hackathons
                </button>
              </div>

              {activeTab === "discussions" && (
                <div className="flex flex-col gap-3">
                  <div className="p-3.5 rounded-xl bg-[#080F0D] border border-[#23372D]">
                    <span className="text-xs font-bold text-[#F4FFF9]">
                      Welcome to the {activeCommunity.name} forum!
                    </span>
                    <p className="text-xs text-[#A6B8AE] mt-1">
                      Introduce your current project, share a paper or ask any question to the members.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "announcements" && (
                <div className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#A6B8AE]">
                  Weekly group study sprint every Wednesday 8:00 PM EST via CON-ED Voice Lab.
                </div>
              )}

              {activeTab === "events" && (
                <div className="p-4 rounded-xl bg-[#080F0D] border border-[#00E69A]/30 text-xs text-[#00E69A] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">Winter Code Sprint 2026</h4>
                    <span className="text-[11px] text-[#A6B8AE]">Starts in 5 days • 48 hours</span>
                  </div>
                  <Link href="/home" className="btn-gradient px-3 py-1.5 rounded-lg text-xs font-bold">
                    RSVP
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE COMMUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#101916] border border-[#00E69A]/40 p-6 sm:p-8 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#23372D] pb-3">
              <h2 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                <Plus size={18} className="text-[#00E69A]" />
                Create a Campus Community
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#71857A] hover:text-[#FF5364]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCommunity} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">
                  Community Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Systems Lab"
                  className="w-full px-3 py-2 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none"
                >
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Robotics & Hardware">Robotics & Hardware</option>
                  <option value="Career & Coding">Career & Coding</option>
                  <option value="Design & UI">Design & UI</option>
                  <option value="Startups & Builders">Startups & Builders</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">
                  Description & Purpose
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this community about? What will students work on together?"
                  className="w-full p-3 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A] h-20 resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">
                  Cover Banner URL (Optional)
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#23372D]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A6B8AE] hover:text-[#F4FFF9]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gradient px-5 py-2 rounded-xl text-xs font-bold">
                  Create Guild
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
