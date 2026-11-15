"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  GraduationCap,
  Sparkles,
  BookOpen,
  FolderGit2,
  Bookmark,
  Share2,
  MessageCircle,
  UserPlus,
  UserCheck,
  Edit3,
  Calendar,
  CheckCircle2,
  ExternalLink,
  BadgeCheck,
  X,
  Heart,
  Code2,
} from "lucide-react";
import { ConEdStore, type StudentProfile, type Post, type ProjectShowcase } from "@/lib/coned-store";

interface ProfileViewProps {
  initialProfile?: StudentProfile;
  isOwnProfile?: boolean;
}

export function ProfileView({ initialProfile, isOwnProfile = true }: ProfileViewProps) {
  const [currentUser, setCurrentUser] = useState<StudentProfile>(ConEdStore.getCurrentUser());
  const [profile, setProfile] = useState<StudentProfile>(initialProfile || ConEdStore.getCurrentUser());
  const [activeTab, setActiveTab] = useState<"posts" | "projects" | "media" | "saved" | "about">("posts");
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(profile.stats.followersCount);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit form state
  const [editFullName, setEditFullName] = useState(profile.fullName);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editCollege, setEditCollege] = useState(profile.college);
  const [editDepartment, setEditDepartment] = useState(profile.department);
  const [editYear, setEditYear] = useState(profile.academicYear);
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatarUrl);
  const [editCoverUrl, setEditCoverUrl] = useState(profile.coverUrl || "");

  // Content
  const allPosts = ConEdStore.getPosts();
  const userPosts = allPosts.filter((p) => p.authorId === profile.id || (isOwnProfile && p.authorId === "usr_me_001"));
  const savedPosts = allPosts.filter((p) => p.isSaved);
  const allProjects = ConEdStore.getProjects();
  const userProjects = allProjects.filter((p) => p.authorId === profile.id || (isOwnProfile && p.authorId === "usr_me_001"));

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setIsFollowing(initialProfile.isFollowing || false);
      setFollowersCount(initialProfile.stats.followersCount);
      setEditFullName(initialProfile.fullName);
      setEditBio(initialProfile.bio);
      setEditCollege(initialProfile.college);
      setEditDepartment(initialProfile.department);
      setEditYear(initialProfile.academicYear);
      setEditAvatarUrl(initialProfile.avatarUrl);
      setEditCoverUrl(initialProfile.coverUrl || "");
    } else {
      const me = ConEdStore.getCurrentUser();
      setProfile(me);
      setCurrentUser(me);
      setFollowersCount(me.stats.followersCount);
      setEditFullName(me.fullName);
      setEditBio(me.bio);
      setEditCollege(me.college);
      setEditDepartment(me.department);
      setEditYear(me.academicYear);
      setEditAvatarUrl(me.avatarUrl);
      setEditCoverUrl(me.coverUrl || "");
    }
  }, [initialProfile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleFollow = () => {
    const res = ConEdStore.toggleFollow(profile.id);
    setIsFollowing(res.isFollowing);
    setFollowersCount(res.newFollowersCount);
    showToast(res.isFollowing ? `You are now following ${profile.fullName}` : `Unfollowed ${profile.fullName}`);
  };

  const handleShareProfile = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Profile link copied to clipboard!");
    }
  };

  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = ConEdStore.setCurrentUser({
      fullName: editFullName.trim(),
      bio: editBio.trim(),
      college: editCollege.trim(),
      department: editDepartment.trim(),
      academicYear: Number(editYear),
      avatarUrl: editAvatarUrl.trim(),
      coverUrl: editCoverUrl.trim(),
    });

    setProfile(updated);
    setCurrentUser(updated);
    setShowEditModal(false);
    showToast("Profile updated successfully!");
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#101916] border border-[#00E69A] text-[#F4FFF9] text-xs font-semibold shadow-[0_0_20px_rgba(0,230,154,0.35)] flex items-center gap-2">
          <Sparkles size={14} className="text-[#00E69A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PROFILE HEADER CARD */}
      <div className="relative rounded-3xl bg-[#101916] border border-[#23372D] overflow-hidden shadow-lg">
        {/* Cover Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-[#080F0D] via-[#131F1A] to-[#18251F] overflow-hidden">
          {profile.coverUrl ? (
            <img
              src={profile.coverUrl}
              alt="Profile Cover"
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#00E69A_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101916] via-transparent to-transparent" />
        </div>

        {/* Profile Info Overlay Row */}
        <div className="relative px-6 pb-6 pt-0 sm:px-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar with emerald glowing ring */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#050908] p-1 border-2 border-[#00E69A] shadow-[0_0_25px_rgba(0,230,154,0.35)] overflow-hidden shrink-0">
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Name, Username, Badges */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#F4FFF9]">
                  {profile.fullName}
                </h1>
                {profile.isPlatformBadge && (
                  <span className="text-[#00E69A] drop-shadow-[0_0_6px_#00E69A]" title="Official CON-ED Companion">
                    <BadgeCheck size={18} />
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-[#00E69A]/15 border border-[#00E69A]/30 text-[10px] font-bold text-[#00E69A]">
                  Student Leader
                </span>
              </div>
              <span className="text-xs text-[#71857A]">@{profile.username}</span>

              {/* College & Department */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#A6B8AE] mt-2">
                <span className="flex items-center gap-1">
                  <GraduationCap size={14} className="text-[#00E69A]" />
                  {profile.college}
                </span>
                <span>•</span>
                <span>{profile.department}</span>
                <span>•</span>
                <span>Year {profile.academicYear}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isOwnProfile ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#131F1A] border border-[#23372D] hover:border-[#00E69A] text-xs font-bold text-[#F4FFF9] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="p-2 rounded-xl bg-[#131F1A] border border-[#23372D] text-[#A6B8AE] hover:text-[#F4FFF9] transition-colors"
                  title="Share Profile"
                >
                  <Share2 size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isFollowing
                      ? "bg-[#131F1A] border border-[#23372D] text-[#A6B8AE] hover:text-[#FF5364]"
                      : "btn-gradient"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={14} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Follow</span>
                    </>
                  )}
                </button>

                <Link
                  href="/messages"
                  className="px-4 py-2.5 rounded-xl bg-[#131F1A] border border-[#23372D] hover:border-[#00E69A] text-xs font-bold text-[#F4FFF9] flex items-center gap-1.5"
                >
                  <MessageCircle size={14} />
                  <span>Message</span>
                </Link>

                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="p-2.5 rounded-xl bg-[#131F1A] border border-[#23372D] text-[#A6B8AE] hover:text-[#F4FFF9] transition-colors"
                >
                  <Share2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio, Stats, and Skills Strip */}
        <div className="px-6 pb-6 sm:px-8 border-t border-[#23372D]/60 pt-4 flex flex-col gap-4">
          <p className="text-xs sm:text-sm text-[#A6B8AE] leading-relaxed max-w-3xl">
            {profile.bio}
          </p>

          {/* Stats Counters */}
          <div className="flex items-center gap-6 py-2">
            <div className="flex items-center gap-1.5 text-xs">
              <strong className="text-[#F4FFF9] font-extrabold">{userPosts.length}</strong>
              <span className="text-[#71857A]">Posts</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <strong className="text-[#F4FFF9] font-extrabold">{followersCount}</strong>
              <span className="text-[#71857A]">Followers</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <strong className="text-[#F4FFF9] font-extrabold">{profile.stats.followingCount}</strong>
              <span className="text-[#71857A]">Following</span>
            </div>
            {profile.stats.compatibilityScore && !isOwnProfile && (
              <div className="ml-auto px-3 py-1 rounded-full bg-[#00E69A]/15 border border-[#00E69A]/40 text-xs font-bold text-[#00E69A]">
                {profile.stats.compatibilityScore}% Peer Compatibility
              </div>
            )}
          </div>

          {/* Skills & Interests Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#23372D]/40">
            <span className="text-xs font-bold text-[#F4FFF9] mr-1">Skills:</span>
            {profile.skills.map((s, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-[#131F1A] border border-[#23372D] text-xs font-medium text-[#00E69A] flex items-center gap-1.5"
              >
                <span>{s.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00E69A]/20 text-[#67F5B8] uppercase font-bold">
                  {s.level}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* 2. PROFILE TABS */}
        <div className="px-6 sm:px-8 border-t border-[#23372D] flex items-center gap-3 overflow-x-auto">
          {[
            { id: "posts", label: "Posts", count: userPosts.length },
            { id: "projects", label: "Projects", count: userProjects.length },
            { id: "media", label: "Media", count: userPosts.filter((p) => p.imageUrl).length },
            ...(isOwnProfile ? [{ id: "saved", label: "Saved Posts", count: savedPosts.length }] : []),
            { id: "about", label: "About & Academics" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-[#00E69A] text-[#00E69A]"
                  : "border-transparent text-[#71857A] hover:text-[#F4FFF9]"
              }`}
            >
              <span>{tab.label}</span>
              {"count" in tab && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#18251F] text-[#A6B8AE]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {/* TAB: POSTS */}
      {activeTab === "posts" && (
        <div className="flex flex-col gap-4">
          {userPosts.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#101916] border border-[#23372D] text-center">
              <p className="text-xs text-[#71857A]">No posts published yet.</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-[#101916] border border-[#23372D] flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#00E69A] uppercase tracking-wider">
                    {post.postType}
                  </span>
                  <span className="text-[10px] text-[#71857A]">{post.createdAt}</span>
                </div>
                <p className="text-xs text-[#F4FFF9] leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
                {post.imageUrl && (
                  <div className="w-full max-h-72 rounded-xl overflow-hidden border border-[#23372D]">
                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="pt-2 border-t border-[#23372D]/60 flex items-center justify-between text-xs text-[#71857A]">
                  <span className="flex items-center gap-1">
                    <Heart size={14} className="text-[#00E69A]" /> {post.likesCount} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} /> {post.comments.length} comments
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: PROJECTS */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userProjects.length === 0 ? (
            <div className="col-span-2 p-10 rounded-2xl bg-[#101916] border border-[#23372D] text-center">
              <p className="text-xs text-[#71857A]">No projects showcased yet.</p>
            </div>
          ) : (
            userProjects.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[#101916] border border-[#23372D] flex flex-col justify-between gap-3"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#F4FFF9]">{p.title}</h3>
                  <p className="text-xs text-[#A6B8AE] mt-1 leading-relaxed">{p.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#131F1A] text-[10px] font-semibold text-[#00E69A]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                {p.githubUrl && (
                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#00E69A] hover:underline flex items-center gap-1 w-fit"
                  >
                    View Code Repository <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: MEDIA */}
      {activeTab === "media" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {userPosts
            .filter((p) => p.imageUrl)
            .map((post) => (
              <div
                key={post.id}
                className="aspect-square rounded-2xl overflow-hidden border border-[#23372D] relative group"
              >
                <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center">
                  <p className="text-xs text-white font-medium line-clamp-3">{post.content}</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* TAB: SAVED (Private to owner) */}
      {activeTab === "saved" && isOwnProfile && (
        <div className="flex flex-col gap-4">
          <div className="p-3.5 rounded-xl bg-[#131F1A] border border-[#23372D] flex items-center gap-2 text-xs text-[#00E69A]">
            <Bookmark size={14} />
            <span>Saved posts are private and only visible to you.</span>
          </div>
          {savedPosts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#101916] border border-[#23372D] text-center">
              <p className="text-xs text-[#71857A]">No saved posts yet.</p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-[#101916] border border-[#23372D] flex flex-col gap-2"
              >
                <span className="text-xs font-bold text-[#F4FFF9]">{post.authorName}</span>
                <p className="text-xs text-[#A6B8AE]">{post.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: ABOUT & ACADEMICS */}
      {activeTab === "about" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#101916] border border-[#23372D] flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#F4FFF9]">Academic Background</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#23372D]/40">
                <span className="text-[#71857A]">University:</span>
                <span className="text-[#F4FFF9] font-semibold">{profile.college}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#23372D]/40">
                <span className="text-[#71857A]">Department:</span>
                <span className="text-[#F4FFF9] font-semibold">{profile.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#23372D]/40">
                <span className="text-[#71857A]">Academic Year:</span>
                <span className="text-[#F4FFF9] font-semibold">Year {profile.academicYear} (Class of 2027)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#71857A]">Contact Preference:</span>
                <span className="text-[#00E69A] font-semibold capitalize">{profile.contactPreference}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#101916] border border-[#23372D] flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#F4FFF9]">Ambitions & Goals</h3>
            <div className="flex flex-col gap-2">
              {profile.goals.map((g, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#A6B8AE]">
                  <CheckCircle2 size={14} className="text-[#00E69A] shrink-0 mt-0.5" />
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#101916] border border-[#00E69A]/40 p-6 sm:p-8 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#23372D] pb-3">
              <h2 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                <Edit3 size={16} className="text-[#00E69A]" />
                Edit Student Profile
              </h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-[#71857A] hover:text-[#FF5364]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">Bio / Headline</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A] h-24 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">College / University</label>
                  <input
                    type="text"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">Academic Year</label>
                <select
                  value={editYear}
                  onChange={(e) => setEditYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                >
                  <option value={1}>1st Year (Freshman)</option>
                  <option value={2}>2nd Year (Sophomore)</option>
                  <option value={3}>3rd Year (Junior)</option>
                  <option value={4}>4th Year (Senior)</option>
                  <option value={5}>Graduate / Masters / PhD</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A6B8AE] mb-1 block">Cover Banner URL</label>
                <input
                  type="url"
                  value={editCoverUrl}
                  onChange={(e) => setEditCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#23372D]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A6B8AE] hover:text-[#F4FFF9]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gradient px-6 py-2.5 rounded-xl text-xs font-bold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
