"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Sparkles,
  Plus,
  Image as ImageIcon,
  BarChart2,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  UserCheck,
  Flag,
  Globe,
  Building,
  Lock,
  BadgeCheck,
  Compass,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  ConEdStore,
  type Post,
  type Story,
  type StudentProfile,
} from "@/lib/coned-store";
import { DISCOVER_ITEMS, type DiscoverItem } from "@/components/discover-view";

export function HomeView({
  userId,
  fullName,
  avatarPath,
}: {
  userId: string;
  fullName: string;
  avatarPath: string | null;
}) {
  // Store States
  const [currentUser, setCurrentUser] = useState<StudentProfile>(ConEdStore.getCurrentUser());
  const [posts, setPosts] = useState<Post[]>(ConEdStore.getPosts());
  const [stories, setStories] = useState<Story[]>(ConEdStore.getStories());
  const [suggestedStudents, setSuggestedStudents] = useState<StudentProfile[]>([]);

  // Top Section Switcher: "feed" vs "explore"
  const [mainSection, setMainSection] = useState<"feed" | "explore">("feed");

  // Feed Sub-filters
  const [feedFilter, setFeedFilter] = useState<"for_you" | "following" | "campus">("for_you");

  // Explore Tab State
  const [exploreCategory, setExploreCategory] = useState("All");
  const [exploreQuery, setExploreQuery] = useState("");
  const [selectedExploreItem, setSelectedExploreItem] = useState<DiscoverItem | null>(null);

  // Post Composer State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [composerPostType, setComposerPostType] = useState<"update" | "project" | "achievement" | "poll">("update");
  const [composerVisibility, setComposerVisibility] = useState<"public" | "campus" | "followers">("public");
  const [composerImageUrl, setComposerImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Comments Expanded
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Story Viewer Modal State
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Create Story Modal State
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [storyCaption, setStoryCaption] = useState("");
  const [storyMediaUrl, setStoryMediaUrl] = useState("");

  // Report Modal State
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("Spam");

  // Initialize
  useEffect(() => {
    const me = ConEdStore.getCurrentUser();
    setCurrentUser(me);
    setPosts(ConEdStore.getPosts());
    setStories(ConEdStore.getStories());

    // Suggested students: exclude self
    const candidates = ConEdStore.getStudents().filter((s) => s.id !== me.id && s.id !== "usr_me_001");
    setSuggestedStudents(candidates.slice(0, 3));
  }, []);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Story Timer
  useEffect(() => {
    if (activeStoryIndex === null) return;
    setStoryProgress(0);
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((curr) => (curr !== null ? curr + 1 : null));
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, stories.length]);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    ConEdStore.markStoryViewed(stories[index].id);
    setStories(ConEdStore.getStories());
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyCaption.trim() && !storyMediaUrl.trim()) return;

    ConEdStore.addStory({
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatarUrl,
      mediaUrl: storyMediaUrl.trim() || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
      caption: storyCaption.trim(),
      category: "Update",
    });

    setStories(ConEdStore.getStories());
    setShowCreateStoryModal(false);
    setStoryCaption("");
    setStoryMediaUrl("");
    showToast("Story shared with your campus!");
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() && !composerImageUrl.trim() && !pollQuestion.trim()) return;

    setIsSubmittingPost(true);

    const validPollOptions = pollOptions
      .map((opt) => opt.trim())
      .filter(Boolean)
      .map((text) => ({ text, votes: 0 }));

    const hasPoll = showPollCreator && pollQuestion.trim() && validPollOptions.length >= 2;

    ConEdStore.addPost({
      content: composerText.trim(),
      postType: hasPoll ? "poll" : composerPostType,
      visibility: composerVisibility,
      tags: composerText.match(/#[a-zA-Z0-9_]+/g)?.map((t) => t.slice(1)) || ["CONED"],
      imageUrl: composerImageUrl.trim() || undefined,
      poll: hasPoll
        ? {
            question: pollQuestion.trim(),
            options: validPollOptions,
          }
        : undefined,
    });

    setPosts(ConEdStore.getPosts());
    setComposerText("");
    setComposerImageUrl("");
    setShowImageInput(false);
    setShowPollCreator(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setIsComposerOpen(false);
    setIsSubmittingPost(false);
    showToast("Post shared to feed!");
  };

  const handleToggleLike = (postId: string) => {
    ConEdStore.toggleLike(postId);
    setPosts(ConEdStore.getPosts());
  };

  const handleToggleSave = (postId: string) => {
    ConEdStore.toggleSave(postId);
    setPosts(ConEdStore.getPosts());
    showToast("Post saved to profile!");
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    ConEdStore.votePoll(postId, optionIndex);
    setPosts(ConEdStore.getPosts());
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    ConEdStore.addComment(postId, text);
    setPosts(ConEdStore.getPosts());
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleToggleFollow = (studentId: string) => {
    const { isFollowing } = ConEdStore.toggleFollow(studentId);
    setSuggestedStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isFollowing } : s))
    );
    showToast(isFollowing ? "Connected with student!" : "Unfollowed student.");
  };

  const handleShare = (post: Post) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/home#${post.id}`);
      showToast("Link copied to clipboard!");
    }
  };

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (feedFilter === "following") {
        return p.authorId === "usr_coned_ai" || p.authorId === "usr_priya_002";
      }
      if (feedFilter === "campus") {
        return p.authorCollege === currentUser.college;
      }
      return true;
    });
  }, [posts, feedFilter, currentUser.college]);

  // Filtered Explore Items
  const filteredExplore = useMemo(() => {
    return DISCOVER_ITEMS.filter((item) => {
      const matchCat = exploreCategory === "All" || item.category.toLowerCase() === exploreCategory.toLowerCase();
      const matchQuery =
        !exploreQuery.trim() ||
        item.title.toLowerCase().includes(exploreQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(exploreQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(exploreQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [exploreCategory, exploreQuery]);

  const exploreCategories = [
    "All",
    "Technology",
    "AI",
    "Programming",
    "Design",
    "Education",
    "Business",
    "College Life",
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#101916] border border-[#00E69A] text-[#F4FFF9] text-xs font-semibold shadow-[0_0_20px_rgba(0,230,154,0.3)] flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check size={14} className="text-[#00E69A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Switcher: Feed vs Explore */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#23372D] pb-3">
        <div className="flex items-center gap-2 bg-[#080F0D] p-1 rounded-xl border border-[#23372D]">
          <button
            type="button"
            onClick={() => setMainSection("feed")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mainSection === "feed"
                ? "bg-[#18251F] text-[#00E69A] shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            Social Feed
          </button>
          <button
            type="button"
            onClick={() => setMainSection("explore")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mainSection === "explore"
                ? "bg-[#18251F] text-[#00E69A] shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            <Compass size={14} />
            <span>Explore & Discover</span>
          </button>
        </div>

        {mainSection === "feed" ? (
          <div className="flex items-center gap-1 text-xs">
            {(["for_you", "following", "campus"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFeedFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize ${
                  feedFilter === tab
                    ? "text-[#00E69A] bg-[#101916] border border-[#00D995]/40"
                    : "text-[#71857A] hover:text-[#A6B8AE]"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-[#71857A]">
            Discover student projects, research & code
          </div>
        )}
      </div>

      {/* ===================== VIEW 1: SOCIAL FEED ===================== */}
      {mainSection === "feed" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* 1. Compact Stories Row */}
            <div className="bg-[#101916] border border-[#23372D] rounded-2xl p-3.5 flex items-center gap-3 overflow-x-auto scrollbar-none">
              {/* Add Story Button */}
              <button
                type="button"
                onClick={() => setShowCreateStoryModal(true)}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                title="Share 24h Story"
              >
                <div className="relative w-12 h-12 rounded-full p-0.5 bg-[#080F0D] border border-dashed border-[#00E69A] group-hover:border-[#00D995] flex items-center justify-center transition">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00E69A] text-[#050908] flex items-center justify-center font-bold text-[10px]">
                    +
                  </span>
                </div>
                <span className="text-[10px] text-[#A6B8AE] font-medium max-w-[54px] truncate">
                  Your Story
                </span>
              </button>

              {/* Story Avatars */}
              {stories.map((story, idx) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => handleOpenStory(idx)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 rounded-full p-0.5 transition-transform duration-200 group-hover:scale-105 ${
                      story.isViewed
                        ? "bg-[#23372D]"
                        : "bg-gradient-to-tr from-[#00E69A] to-[#67F5B8] p-[1.5px]"
                    }`}
                  >
                    <img
                      src={story.authorAvatar}
                      alt={story.authorName}
                      className="w-full h-full rounded-full object-cover border-2 border-[#101916]"
                    />
                  </div>
                  <span className="text-[10px] text-[#A6B8AE] font-medium max-w-[54px] truncate">
                    {story.authorName.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* 2. Simplified Create Post Box */}
            <div className="bg-[#101916] border border-[#23372D] rounded-2xl p-4 transition-all">
              <div className="flex items-start gap-3">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-[#23372D] shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <textarea
                    rows={isComposerOpen ? 3 : 2}
                    value={composerText}
                    onFocus={() => setIsComposerOpen(true)}
                    onChange={(e) => setComposerText(e.target.value)}
                    placeholder="Share knowledge, achievements, questions, or project updates..."
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl p-3 text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A] resize-none"
                  />

                  {/* Optional Image Input */}
                  {showImageInput && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Paste image URL (https://...)"
                        value={composerImageUrl}
                        onChange={(e) => setComposerImageUrl(e.target.value)}
                        className="flex-1 bg-[#080F0D] border border-[#23372D] rounded-lg px-3 py-1.5 text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowImageInput(false)}
                        className="text-[#71857A] hover:text-[#F4FFF9] text-xs px-2"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Optional Poll Creator */}
                  {showPollCreator && (
                    <div className="mt-2.5 p-3 rounded-xl bg-[#080F0D] border border-[#23372D] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#A6B8AE]">
                        <span>Create Live Student Poll</span>
                        <button
                          type="button"
                          onClick={() => setShowPollCreator(false)}
                          className="text-[#71857A] hover:text-[#F4FFF9]"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Ask a question..."
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        className="w-full bg-[#101916] border border-[#23372D] rounded-lg px-3 py-1.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                      />
                      {pollOptions.map((opt, optIdx) => (
                        <input
                          key={optIdx}
                          type="text"
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...pollOptions];
                            updated[optIdx] = e.target.value;
                            setPollOptions(updated);
                          }}
                          className="w-full bg-[#101916] border border-[#23372D] rounded-lg px-3 py-1.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                        />
                      ))}
                      {pollOptions.length < 4 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions([...pollOptions, ""])}
                          className="text-[11px] text-[#00E69A] hover:underline font-semibold"
                        >
                          + Add option
                        </button>
                      )}
                    </div>
                  )}

                  {/* Composer Footer Actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#23372D]/50">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowImageInput(!showImageInput);
                          setIsComposerOpen(true);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          showImageInput
                            ? "bg-[#18251F] text-[#00E69A]"
                            : "text-[#71857A] hover:text-[#F4FFF9] hover:bg-[#18251F]"
                        }`}
                        title="Attach Photo"
                      >
                        <ImageIcon size={15} />
                        <span className="hidden sm:inline text-[11px]">Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowPollCreator(!showPollCreator);
                          setIsComposerOpen(true);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          showPollCreator
                            ? "bg-[#18251F] text-[#00E69A]"
                            : "text-[#71857A] hover:text-[#F4FFF9] hover:bg-[#18251F]"
                        }`}
                        title="Create Poll"
                      >
                        <BarChart2 size={15} />
                        <span className="hidden sm:inline text-[11px]">Poll</span>
                      </button>

                      {/* Audience Selector */}
                      <select
                        value={composerVisibility}
                        onChange={(e) => setComposerVisibility(e.target.value as any)}
                        className="bg-[#080F0D] border border-[#23372D] rounded-lg px-2 py-1 text-[11px] text-[#A6B8AE] focus:outline-none focus:border-[#00E69A] cursor-pointer"
                      >
                        <option value="public">Public</option>
                        <option value="campus">Campus Only</option>
                        <option value="followers">Followers</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmittingPost || (!composerText.trim() && !composerImageUrl.trim() && !pollQuestion.trim())}
                      onClick={handleCreatePost}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                    >
                      {isSubmittingPost ? "Posting..." : "Share"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Main Social Feed Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const isCommentsOpen = Boolean(expandedComments[post.id]);
                return (
                  <article
                    key={post.id}
                    id={post.id}
                    className="bg-[#101916] border border-[#23372D] rounded-2xl p-5 transition hover:border-[#23372D]/90"
                  >
                    {/* Post Author Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${post.authorUsername}`}>
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-10 h-10 rounded-full object-cover border border-[#23372D] hover:border-[#00E69A] transition"
                          />
                        </Link>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/profile/${post.authorUsername}`}
                              className="text-xs font-bold text-[#F4FFF9] hover:text-[#00E69A] transition"
                            >
                              {post.authorName}
                            </Link>
                            {post.isPlatformBadge && (
                              <BadgeCheck size={14} className="text-[#00E69A]" />
                            )}
                          </div>
                          <div className="text-[11px] text-[#71857A] flex items-center gap-1">
                            <span>{post.authorCollege}</span>
                            <span>•</span>
                            <span>{post.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-[#71857A]">
                        {post.visibility === "public" ? (
                          <Globe size={13} title="Public" />
                        ) : post.visibility === "campus" ? (
                          <Building size={13} title="Campus Only" />
                        ) : (
                          <Lock size={13} title="Followers" />
                        )}
                        <button
                          type="button"
                          onClick={() => setReportingPostId(post.id)}
                          className="p-1 rounded-md text-[#71857A] hover:text-[#FF5364] transition"
                          title="Report post"
                        >
                          <Flag size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs sm:text-sm text-[#F4FFF9] leading-relaxed whitespace-pre-line mb-3">
                      {post.content}
                    </p>

                    {/* Post Image */}
                    {post.imageUrl && (
                      <div className="rounded-xl overflow-hidden mb-3 border border-[#23372D] max-h-96 bg-[#080F0D]">
                        <img
                          src={post.imageUrl}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Interactive Poll */}
                    {post.poll && (
                      <div className="p-3.5 rounded-xl bg-[#080F0D] border border-[#23372D] space-y-2 mb-3">
                        <div className="text-xs font-bold text-[#F4FFF9]">
                          {post.poll.question}
                        </div>
                        {(() => {
                          const totalVotes = post.poll.options.reduce((acc, o) => acc + o.votes, 0);
                          const hasVoted = post.poll.hasVoted;
                          return post.poll.options.map((opt, optIdx) => {
                            const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={hasVoted}
                                onClick={() => handleVotePoll(post.id, optIdx)}
                                className={`w-full p-2.5 rounded-lg border text-left text-xs relative overflow-hidden transition ${
                                  hasVoted
                                    ? "bg-[#101916] border-[#23372D]"
                                    : "bg-[#101916] hover:bg-[#18251F] border-[#23372D] hover:border-[#00D995]/50 cursor-pointer"
                                }`}
                              >
                                {hasVoted && (
                                  <div
                                    className="absolute inset-y-0 left-0 bg-[#00E69A]/15 transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                )}
                                <div className="relative flex justify-between items-center z-10">
                                  <span className="font-medium text-[#F4FFF9]">{opt.text}</span>
                                  {hasVoted && (
                                    <span className="font-bold text-[#00E69A]">{pct}%</span>
                                  )}
                                </div>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] text-[#00E69A] bg-[#00E69A]/10 px-2 py-0.5 rounded-md"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#23372D]/60 text-xs text-[#71857A]">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                            post.isLiked ? "text-[#FF5364]" : "hover:text-[#F4FFF9]"
                          }`}
                        >
                          <Heart
                            size={16}
                            className={post.isLiked ? "fill-[#FF5364]" : ""}
                          />
                          <span>{post.likesCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }))
                          }
                          className="flex items-center gap-1.5 hover:text-[#F4FFF9] transition-colors cursor-pointer"
                        >
                          <MessageCircle size={16} />
                          <span>{post.comments.length}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-1.5 hover:text-[#F4FFF9] transition-colors cursor-pointer"
                        >
                          <Share2 size={15} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSave(post.id)}
                        className={`transition-colors cursor-pointer ${
                          post.isSaved ? "text-[#00E69A]" : "hover:text-[#F4FFF9]"
                        }`}
                        title="Save Post"
                      >
                        <Bookmark
                          size={16}
                          className={post.isSaved ? "fill-[#00E69A]" : ""}
                        />
                      </button>
                    </div>

                    {/* Expandable Comments */}
                    {isCommentsOpen && (
                      <div className="mt-3 pt-3 border-t border-[#23372D]/60 space-y-3">
                        {/* Comment List */}
                        <div className="space-y-2">
                          {post.comments.map((c) => (
                            <div key={c.id} className="flex items-start gap-2 text-xs">
                              <img
                                src={c.authorAvatar}
                                alt={c.authorName}
                                className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                              />
                              <div className="bg-[#080F0D] rounded-xl p-2.5 flex-1 border border-[#23372D]">
                                <span className="font-bold text-[#F4FFF9] mr-1.5">
                                  {c.authorName}
                                </span>
                                <span className="text-[#A6B8AE]">{c.content}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a constructive comment..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddComment(post.id);
                            }}
                            className="flex-1 bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-1.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#18251F] text-[#00E69A] hover:bg-[#00E69A] hover:text-[#050908] transition"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right Rail Column (4 cols) — Compact & Focused */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Compact Trending Section */}
            <div className="bg-[#101916] border border-[#23372D] rounded-2xl p-4">
              <div className="text-xs font-bold text-[#F4FFF9] mb-3 flex items-center justify-between">
                <span>Trending on Campus</span>
                <span className="text-[10px] text-[#00E69A] font-semibold">Live</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { tag: "Hackathon2026", count: "340 discussions" },
                  { tag: "MachineLearning", count: "215 projects" },
                  { tag: "FAANGPrep", count: "180 milestones" },
                  { tag: "RoboticsSwarm", count: "95 updates" },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => {
                      setMainSection("explore");
                      setExploreQuery(item.tag);
                    }}
                    className="w-full flex items-center justify-between text-left text-xs hover:bg-[#18251F] p-1.5 rounded-lg transition"
                  >
                    <div>
                      <span className="font-bold text-[#F4FFF9] block">#{item.tag}</span>
                      <span className="text-[10px] text-[#71857A]">{item.count}</span>
                    </div>
                    <ArrowRight size={12} className="text-[#71857A]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Suggested Peers */}
            <div className="bg-[#101916] border border-[#23372D] rounded-2xl p-4">
              <div className="text-xs font-bold text-[#F4FFF9] mb-3 flex items-center justify-between">
                <span>Suggested Peers</span>
                <Link
                  href="/connections"
                  className="text-[10px] text-[#00E69A] hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {suggestedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Link href={`/profile/${student.username}`}>
                        <img
                          src={student.avatarUrl}
                          alt={student.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-[#23372D]"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          href={`/profile/${student.username}`}
                          className="text-xs font-bold text-[#F4FFF9] hover:text-[#00E69A] truncate block"
                        >
                          {student.fullName}
                        </Link>
                        <span className="text-[10px] text-[#71857A] truncate block">
                          {student.department}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFollow(student.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                        student.isFollowing
                          ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/40"
                          : "bg-[#00E69A] text-[#050908] hover:bg-[#00C982]"
                      }`}
                    >
                      {student.isFollowing ? "Connected" : "+ Follow"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Intelligence Banner */}
            <div className="bg-gradient-to-br from-[#101916] to-[#131F1A] border border-[#00E69A]/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00E69A] mb-1">
                <Sparkles size={14} />
                <span>CON-ED AI Mentor</span>
              </div>
              <p className="text-xs text-[#A6B8AE] mb-3">
                Need guidance on placement interviews, code architecture, or research roadmaps?
              </p>
              <Link
                href="/mentors"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#050908] bg-[#00E69A] hover:bg-[#00C982] transition"
              >
                <span>Ask AI Mentor</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ===================== VIEW 2: INTEGRATED EXPLORE ===================== */}
      {mainSection === "explore" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search & Category Filter Header */}
          <div className="bg-[#101916] border border-[#23372D] rounded-2xl p-4 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71857A]" />
              <input
                type="text"
                placeholder="Search projects, research papers, technologies (e.g. PyTorch, Rust, ROS2)..."
                value={exploreQuery}
                onChange={(e) => setExploreQuery(e.target.value)}
                className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {exploreCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setExploreCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    exploreCategory === cat
                      ? "bg-[#00E69A] text-[#050908] font-bold"
                      : "bg-[#080F0D] text-[#A6B8AE] border border-[#23372D] hover:border-[#00D995]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Masonry Discover Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {filteredExplore.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedExploreItem(item)}
                className="break-inside-avoid bg-[#101916] border border-[#23372D] hover:border-[#00D995]/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] group"
              >
                {item.imageUrl && (
                  <div className="relative overflow-hidden bg-[#080F0D] max-h-64">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                    />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#050908]/80 backdrop-blur-md text-[#00E69A] border border-[#00E69A]/30">
                      {item.type}
                    </span>
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.authorAvatar}
                      alt={item.authorName}
                      className="w-5 h-5 rounded-full object-cover border border-[#23372D]"
                    />
                    <span className="text-[11px] text-[#A6B8AE] font-medium">{item.authorName}</span>
                    <span className="text-[10px] text-[#71857A]">• {item.authorCollege}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#F4FFF9] group-hover:text-[#00E69A] transition leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#A6B8AE] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#18251F] text-[#67F5B8] border border-[#23372D]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#23372D]/50 text-xs text-[#71857A]">
                    <span className="flex items-center gap-1">
                      <Heart size={13} className="text-[#FF5364]" />
                      <span>{item.likesCount}</span>
                    </span>
                    <span className="text-[11px] text-[#00E69A] font-semibold group-hover:underline">
                      View details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== MODALS ===================== */}

      {/* 1. Explore Item Detail Modal */}
      {selectedExploreItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101916] border border-[#23372D] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setSelectedExploreItem(null)}
              className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-[#050908]/80 text-[#A6B8AE] hover:text-[#F4FFF9] flex items-center justify-center"
            >
              <X size={18} />
            </button>

            {selectedExploreItem.imageUrl && (
              <img
                src={selectedExploreItem.imageUrl}
                alt={selectedExploreItem.title}
                className="w-full h-56 object-cover"
              />
            )}

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedExploreItem.authorAvatar}
                  alt={selectedExploreItem.authorName}
                  className="w-9 h-9 rounded-full object-cover border border-[#23372D]"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#F4FFF9]">{selectedExploreItem.authorName}</h4>
                  <span className="text-[11px] text-[#71857A]">{selectedExploreItem.authorCollege}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#F4FFF9]">
                {selectedExploreItem.title}
              </h3>

              <p className="text-xs text-[#A6B8AE] leading-relaxed">
                {selectedExploreItem.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {selectedExploreItem.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#18251F] text-[#00E69A] border border-[#23372D]"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#23372D]">
                <span className="text-xs text-[#71857A]">
                  Category: <strong className="text-[#F4FFF9]">{selectedExploreItem.category}</strong>
                </span>
                <Link
                  href={`/profile/${selectedExploreItem.authorUsername}`}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00E69A] text-[#050908] hover:bg-[#00C982] transition"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Fullscreen 24h Story Viewer */}
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-[580px] bg-[#101916] rounded-2xl overflow-hidden border border-[#23372D] flex flex-col justify-between shadow-2xl">
            {/* Story Top Progress Bar */}
            <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5">
              {stories.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-[#00E69A] transition-all"
                    style={{
                      width:
                        i < activeStoryIndex
                          ? "100%"
                          : i === activeStoryIndex
                          ? `${storyProgress}%`
                          : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Story Author Header */}
            <div className="absolute top-6 inset-x-3 z-20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={stories[activeStoryIndex].authorAvatar}
                  alt={stories[activeStoryIndex].authorName}
                  className="w-8 h-8 rounded-full object-cover border border-[#00E69A]"
                />
                <span className="text-xs font-bold text-white drop-shadow">
                  {stories[activeStoryIndex].authorName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveStoryIndex(null)}
                className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Story Media */}
            <img
              src={stories[activeStoryIndex].mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />

            {/* Story Caption */}
            {stories[activeStoryIndex].caption && (
              <div className="absolute bottom-4 inset-x-4 z-20 p-3 rounded-xl bg-black/60 backdrop-blur-md text-xs text-white text-center">
                {stories[activeStoryIndex].caption}
              </div>
            )}

            {/* Prev / Next Click Handlers */}
            <button
              type="button"
              onClick={() => setActiveStoryIndex((curr) => (curr && curr > 0 ? curr - 1 : 0))}
              className="absolute left-0 inset-y-0 w-1/3 z-10 opacity-0"
              aria-label="Previous story"
            />
            <button
              type="button"
              onClick={() => {
                if (activeStoryIndex < stories.length - 1) {
                  setActiveStoryIndex((curr) => (curr !== null ? curr + 1 : null));
                } else {
                  setActiveStoryIndex(null);
                }
              }}
              className="absolute right-0 inset-y-0 w-1/3 z-10 opacity-0"
              aria-label="Next story"
            />
          </div>
        </div>
      )}

      {/* 3. Create Story Modal */}
      {showCreateStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101916] border border-[#23372D] rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowCreateStoryModal(false)}
              className="absolute top-4 right-4 text-[#71857A] hover:text-[#F4FFF9]"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-[#F4FFF9] mb-1">
              Add to 24h Campus Story
            </h3>
            <p className="text-xs text-[#A6B8AE] mb-4">
              Share a quick moment, hackathon update, or study sprint with fellow students.
            </p>

            <form onSubmit={handleCreateStory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#A6B8AE] mb-1">
                  Media Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={storyMediaUrl}
                  onChange={(e) => setStoryMediaUrl(e.target.value)}
                  className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A6B8AE] mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  placeholder="What's happening right now?"
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  maxLength={120}
                  className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateStoryModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#A6B8AE] hover:text-[#F4FFF9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#050908] bg-[#00E69A] hover:bg-[#00C982] transition"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Report Post Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101916] border border-[#23372D] rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
            <h3 className="text-sm font-bold text-[#F4FFF9] mb-1">Report Content</h3>
            <p className="text-xs text-[#A6B8AE] mb-3">
              Help maintain CON-ED community guidelines.
            </p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl p-2.5 text-xs text-[#F4FFF9] mb-4 focus:outline-none focus:border-[#00E69A]"
            >
              <option>Spam or commercial promotion</option>
              <option>Academic dishonesty violation</option>
              <option>Harassment or offensive language</option>
              <option>Misleading information</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportingPostId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#A6B8AE] hover:text-[#F4FFF9]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportingPostId(null);
                  showToast("Report submitted to moderation queue.");
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF5364]/15 text-[#FF5364] border border-[#FF5364]/30 hover:bg-[#FF5364]/25 transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
