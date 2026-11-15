"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  TrendingUp,
  Award,
  ChevronRight,
  Flame,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  X,
  Check
} from "lucide-react";
import { ConEdStore, type GoalItem } from "@/lib/coned-store";

const PRESET_AI_TEMPLATES = [
  {
    title: "Master Full-Stack AI & LLM Engineering",
    category: "Technical Skills",
    targetDate: "2026-12-15",
    weeklyHours: 12,
    description: "Build production RAG pipelines, fine-tune open-source models, and deploy high-throughput inference APIs.",
    milestones: [
      { id: "m1", title: "Complete Advanced TypeScript & Next.js 16 App Router", completed: true },
      { id: "m2", title: "Implement Vector Embeddings & Hybrid Search with pgvector", completed: true },
      { id: "m3", title: "Build Autonomous Tool-Calling Agent with Streaming UI", completed: false },
      { id: "m4", title: "Deploy Production Kubernetes Cluster with GPU autoscaling", completed: false },
    ],
  },
  {
    title: "Campus Placement & FAANG Technical Prep",
    category: "Career & Placements",
    targetDate: "2026-11-30",
    weeklyHours: 15,
    description: "Master Data Structures, System Design, and behavioral STAR stories for senior engineering interviews.",
    milestones: [
      { id: "m1", title: "Solve 75 LeetCode Blind / NeetCode High-Frequency Problems", completed: true },
      { id: "m2", title: "Review Graph Algorithms, Dynamic Programming & Trees", completed: false },
      { id: "m3", title: "Complete 3 Mock System Design Sessions (Distributed Caching & Messaging)", completed: false },
      { id: "m4", title: "Refine Resume with CON-ED AI Career Mentor and Conduct Mock HR Interviews", completed: false },
    ],
  },
  {
    title: "Launch an Open-Source Student Research Project",
    category: "Projects",
    targetDate: "2027-01-20",
    weeklyHours: 8,
    description: "Author and publish an open-source collaborative benchmark for multi-agent reasoning systems.",
    milestones: [
      { id: "m1", title: "Draft Technical Abstract and Survey 15 Recent arXiv Papers", completed: true },
      { id: "m2", title: "Form Community Team on CON-ED and establish GitHub Repository", completed: false },
      { id: "m3", title: "Run Empirical Evaluation & Benchmark Synthetic Datasets", completed: false },
      { id: "m4", title: "Publish Interactive Web Demo and Submit to Conference Workshop", completed: false },
    ],
  },
];

export function GoalsView() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"goals" | "timeline">("goals");

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Technical Skills");
  const [targetDate, setTargetDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [description, setDescription] = useState("");
  const [milestoneInputs, setMilestoneInputs] = useState(["", ""]);

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    setGoals(ConEdStore.getGoals());
  }, []);

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.progress === 100).length;
  const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals) : 0;
  const allMilestones = goals.flatMap((g) => g.milestones);
  const completedMilestones = allMilestones.filter((m) => m.completed).length;

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    const updated = ConEdStore.toggleMilestone(goalId, milestoneId);
    setGoals([...updated]);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validMilestones = milestoneInputs
      .filter((m) => m.trim().length > 0)
      .map((text, idx) => ({
        id: `m_${Date.now()}_${idx}`,
        title: text.trim(),
        completed: false,
      }));

    const newGoal: GoalItem = {
      id: `goal_${Date.now()}`,
      title: title.trim(),
      category,
      targetDate: targetDate || "2026-12-31",
      weeklyHours: Number(weeklyHours) || 8,
      progress: 0,
      milestones: validMilestones.length > 0 ? validMilestones : [
        { id: `m_${Date.now()}_0`, title: "Define roadmap and core prerequisites", completed: false },
        { id: `m_${Date.now()}_1`, title: "Complete initial prototype / first milestone", completed: false },
      ],
    };

    const updated = [newGoal, ...goals];
    setGoals(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("coned_goals", JSON.stringify(updated));
    }

    // Reset form
    setTitle("");
    setDescription("");
    setTargetDate("");
    setMilestoneInputs(["", ""]);
    setShowCreateModal(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter((g) => g.id !== goalId);
    setGoals(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("coned_goals", JSON.stringify(updated));
    }
  };

  const handleApplyAiTemplate = (template: typeof PRESET_AI_TEMPLATES[0]) => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const newGoal: GoalItem = {
        id: `goal_ai_${Date.now()}`,
        title: template.title,
        category: template.category,
        targetDate: template.targetDate,
        weeklyHours: template.weeklyHours,
        progress: Math.round(
          (template.milestones.filter((m) => m.completed).length / template.milestones.length) * 100
        ),
        milestones: template.milestones,
      };
      const updated = [newGoal, ...goals];
      setGoals(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("coned_goals", JSON.stringify(updated));
      }
      setIsGeneratingAi(false);
      setShowAiModal(false);
    }, 600);
  };

  const handleCustomAiPlan = () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setTimeout(() => {
      const generatedGoal: GoalItem = {
        id: `goal_ai_${Date.now()}`,
        title: aiPrompt.trim(),
        category: "AI Customized Path",
        targetDate: "2027-01-15",
        weeklyHours: 10,
        progress: 0,
        milestones: [
          { id: `m1_${Date.now()}`, title: `Phase 1: Foundations & Architecture for ${aiPrompt.slice(0, 30)}`, completed: false },
          { id: `m2_${Date.now()}`, title: "Phase 2: Core Implementation & Hands-on Lab Practice", completed: false },
          { id: `m3_${Date.now()}`, title: "Phase 3: Peer Code Review & CON-ED Community Feedback", completed: false },
          { id: `m4_${Date.now()}`, title: "Phase 4: Final Demonstration, Deployment & Portfolio Integration", completed: false },
        ],
      };
      const updated = [generatedGoal, ...goals];
      setGoals(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("coned_goals", JSON.stringify(updated));
      }
      setIsGeneratingAi(false);
      setAiPrompt("");
      setShowAiModal(false);
    }, 800);
  };

  const filteredGoals = goals.filter((g) => {
    if (filter === "active") return g.progress < 100;
    if (filter === "completed") return g.progress === 100;
    return true;
  });

  return (
    <div className="min-h-screen pb-24 text-[#F4FFF9]">
      {/* Top Header */}
      <div className="border-b border-[#23372D] bg-[#080F0D]/80 backdrop-blur-md px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#00E69A] mb-1">
              <Flame size={15} className="animate-pulse" />
              Pillar 5 — Achieve & Grow
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F4FFF9]">
              Goals & Personal Progress
            </h1>
            <p className="text-sm text-[#A6B8AE] mt-1 max-w-2xl">
              Turn academic and career ambitions into structured, milestone-driven achievements. Track study velocity and unlock personalized AI recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 shadow-[0_0_20px_rgba(0,230,154,0.3)] transition"
            >
              <Sparkles size={16} />
              Generate AI Plan
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#F4FFF9] bg-[#101916] hover:bg-[#18251F] border border-[#23372D] hover:border-[#00D995] transition"
            >
              <Plus size={16} />
              New Goal
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 space-y-8">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-5 shadow-lg relative overflow-hidden group hover:border-[#00D995]/40 transition">
            <div className="flex items-center justify-between text-xs text-[#A6B8AE] mb-2 font-medium">
              <span>Overall Velocity</span>
              <TrendingUp size={16} className="text-[#00E69A]" />
            </div>
            <div className="text-3xl font-black text-[#F4FFF9]">{avgProgress}%</div>
            <div className="w-full bg-[#18251F] h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-[#00E69A] h-full transition-all duration-700"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-[#71857A] mt-2 block font-medium">
              Across {totalGoals} active targets
            </span>
          </div>

          <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-5 shadow-lg relative overflow-hidden group hover:border-[#00D995]/40 transition">
            <div className="flex items-center justify-between text-xs text-[#A6B8AE] mb-2 font-medium">
              <span>Milestones Finished</span>
              <CheckCircle2 size={16} className="text-[#00E69A]" />
            </div>
            <div className="text-3xl font-black text-[#F4FFF9]">
              {completedMilestones} <span className="text-lg text-[#71857A]">/ {allMilestones.length}</span>
            </div>
            <span className="text-[11px] text-[#00E69A] mt-3 block font-semibold flex items-center gap-1">
              +4 completed this week
            </span>
          </div>

          <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-5 shadow-lg relative overflow-hidden group hover:border-[#00D995]/40 transition">
            <div className="flex items-center justify-between text-xs text-[#A6B8AE] mb-2 font-medium">
              <span>Target Study Velocity</span>
              <Clock size={16} className="text-[#67F5B8]" />
            </div>
            <div className="text-3xl font-black text-[#F4FFF9]">
              24 <span className="text-lg text-[#71857A]">hrs/wk</span>
            </div>
            <span className="text-[11px] text-[#A6B8AE] mt-3 block font-medium">
              18.5 hrs logged this week
            </span>
          </div>

          <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-5 shadow-lg relative overflow-hidden group hover:border-[#00D995]/40 transition">
            <div className="flex items-center justify-between text-xs text-[#A6B8AE] mb-2 font-medium">
              <span>Consistency Streak</span>
              <Flame size={16} className="text-[#FFC15A]" />
            </div>
            <div className="text-3xl font-black text-[#FFC15A] flex items-center gap-2">
              14 <span className="text-sm font-semibold text-[#F4FFF9]">Days</span>
            </div>
            <span className="text-[11px] text-[#00E69A] mt-3 block font-medium">
              Top 5% among student peers
            </span>
          </div>
        </div>

        {/* Filters and Sub-Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#23372D] pb-4">
          <div className="flex items-center gap-2 bg-[#080F0D] p-1 rounded-xl border border-[#23372D]">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === "all"
                  ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                  : "text-[#A6B8AE] hover:text-[#F4FFF9]"
              }`}
            >
              All Goals ({goals.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === "active"
                  ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                  : "text-[#A6B8AE] hover:text-[#F4FFF9]"
              }`}
            >
              In Progress ({goals.filter((g) => g.progress < 100).length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === "completed"
                  ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                  : "text-[#A6B8AE] hover:text-[#F4FFF9]"
              }`}
            >
              Completed ({completedGoals})
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#A6B8AE]">
            <span className="w-2 h-2 rounded-full bg-[#00E69A] animate-ping" />
            AI Synced with Learning Track
          </div>
        </div>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#23372D] bg-[#101916]/40 p-12 text-center">
            <Target size={40} className="mx-auto text-[#71857A] mb-3" />
            <h3 className="text-lg font-bold text-[#F4FFF9]">No goals in this filter</h3>
            <p className="text-sm text-[#A6B8AE] mt-1 max-w-md mx-auto">
              Start by picking a pre-built roadmap from CON-ED AI or create a custom target to track your milestone progress.
            </p>
            <button
              onClick={() => setShowAiModal(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#050908] bg-[#00E69A] hover:bg-[#00C982] transition"
            >
              <Sparkles size={14} />
              Explore AI Learning Roadmaps
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredGoals.map((goal) => {
              const isDone = goal.progress === 100;
              return (
                <div
                  key={goal.id}
                  className={`rounded-2xl bg-[#101916] border transition-all duration-300 p-6 ${
                    isDone
                      ? "border-[#00E69A]/40 bg-[#101916]/80"
                      : "border-[#23372D] hover:border-[#00D995]/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#18251F] text-[#00E69A] border border-[#23372D]">
                          {goal.category}
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00E69A]/20 text-[#00E69A] flex items-center gap-1 border border-[#00E69A]/30">
                            <Check size={11} /> Completed
                          </span>
                        )}
                        <span className="text-xs text-[#71857A] flex items-center gap-1">
                          <Calendar size={13} /> Target: {goal.targetDate}
                        </span>
                        <span className="text-xs text-[#71857A] flex items-center gap-1">
                          <Clock size={13} /> {goal.weeklyHours} hrs/week
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-[#F4FFF9] pt-1">
                        {goal.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Radial Progress percentage */}
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#00E69A]">{goal.progress}%</span>
                        <span className="block text-[10px] text-[#71857A] uppercase font-semibold">Done</span>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 rounded-xl text-[#71857A] hover:text-[#FF5364] hover:bg-[#18251F] transition"
                        title="Delete Goal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#080F0D] h-2 rounded-full mt-4 overflow-hidden border border-[#23372D]">
                    <div
                      className="bg-gradient-to-r from-[#00E69A] to-[#67F5B8] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  {/* Milestones Checklist */}
                  <div className="mt-6 pt-5 border-t border-[#23372D]/60 space-y-2.5">
                    <div className="text-xs font-bold text-[#A6B8AE] tracking-wide uppercase mb-3 flex items-center justify-between">
                      <span>Actionable Milestones</span>
                      <span className="text-[11px] text-[#71857A] font-normal lowercase">
                        click to toggle completion
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {goal.milestones.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleToggleMilestone(goal.id, m.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                            m.completed
                              ? "bg-[#080F0D]/70 text-[#71857A] border border-[#23372D]/40 line-through"
                              : "bg-[#131F1A] hover:bg-[#18251F] text-[#F4FFF9] border border-[#23372D] hover:border-[#00D995]/40"
                          }`}
                        >
                          <span className="mt-0.5 shrink-0">
                            {m.completed ? (
                              <CheckCircle2 size={16} className="text-[#00E69A]" />
                            ) : (
                              <Circle size={16} className="text-[#71857A]" />
                            )}
                          </span>
                          <span className="text-xs font-medium leading-snug">
                            {m.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Weekly Focus & Velocity Calendar Strip */}
        <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                <BrainCircuit size={18} className="text-[#00E69A]" />
                Weekly Study Velocity & Commitment
              </h3>
              <p className="text-xs text-[#A6B8AE] mt-0.5">
                Calculated based on your daily milestone completions and active time logged with CON-ED AI.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#00E69A] bg-[#18251F] px-3 py-1 rounded-full border border-[#23372D]">
              Target: 24 hrs
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {[
              { day: "Mon", hours: 4.5, pct: 90 },
              { day: "Tue", hours: 3.2, pct: 64 },
              { day: "Wed", hours: 5.0, pct: 100 },
              { day: "Thu", hours: 2.8, pct: 56 },
              { day: "Fri", hours: 4.0, pct: 80 },
              { day: "Sat", hours: 6.2, pct: 100 },
              { day: "Sun", hours: 3.5, pct: 70 },
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-full bg-[#080F0D] rounded-xl h-24 flex items-end p-1.5 border border-[#23372D]">
                  <div
                    className="w-full bg-gradient-to-t from-[#008F62] to-[#00E69A] rounded-lg transition-all duration-700"
                    style={{ height: `${d.pct}%` }}
                    title={`${d.hours} hours`}
                  />
                </div>
                <span className="text-[11px] font-bold text-[#A6B8AE]">{d.day}</span>
                <span className="text-[10px] text-[#71857A]">{d.hours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Create Goal Modal */}
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
              <Target size={20} className="text-[#00E69A]" />
              Create a New Goal
            </h3>
            <p className="text-xs text-[#A6B8AE] mt-1 mb-5">
              Break down your ambitions into concrete, measurable steps.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master LangChain & Distributed AI Pipelines"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-sm text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2.5 text-sm text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  >
                    <option>Technical Skills</option>
                    <option>Career & Placements</option>
                    <option>Projects</option>
                    <option>Academics & Research</option>
                    <option>Personal Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2 text-sm text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                  Weekly Commitment (Hours): {weeklyHours} hrs
                </label>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-[#00E69A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                  Initial Milestones
                </label>
                <div className="space-y-2">
                  {milestoneInputs.map((val, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Milestone ${idx + 1}`}
                      value={val}
                      onChange={(e) => {
                        const next = [...milestoneInputs];
                        next[idx] = e.target.value;
                        setMilestoneInputs(next);
                      }}
                      className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setMilestoneInputs([...milestoneInputs, ""])}
                    className="text-xs text-[#00E69A] hover:underline flex items-center gap-1 font-semibold pt-1"
                  >
                    <Plus size={12} /> Add another milestone
                  </button>
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Roadmap Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101916] border border-[#00D995]/40 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-5 right-5 text-[#71857A] hover:text-[#F4FFF9]"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-[#00E69A] mb-1">
              <Sparkles size={16} />
              CON-ED AI Mentorship Engine
            </div>
            <h3 className="text-xl font-extrabold text-[#F4FFF9]">
              Generate Personalized Learning Roadmap
            </h3>
            <p className="text-xs text-[#A6B8AE] mt-1 mb-5">
              Choose an industry-grade curated pathway or describe any custom objective. CON-ED AI will generate weekly milestones with realistic progression benchmarks.
            </p>

            {/* Prompt input */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#A6B8AE] mb-2">
                Custom Ambition or Topic
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Build an Autonomous Financial Trading Agent in Rust & Python"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 bg-[#080F0D] border border-[#23372D] rounded-xl px-4 py-2.5 text-sm text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                />
                <button
                  onClick={handleCustomAiPlan}
                  disabled={!aiPrompt.trim() || isGeneratingAi}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 disabled:opacity-50 transition shrink-0 flex items-center gap-2"
                >
                  {isGeneratingAi ? "Synthesizing..." : "Generate"}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="text-xs font-bold text-[#71857A] uppercase tracking-wider mb-3">
              Or Pick a High-Impact Student Roadmap
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {PRESET_AI_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D] hover:border-[#00D995] transition group flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#00E69A] uppercase">
                      {tmpl.category} • {tmpl.weeklyHours}h/wk
                    </span>
                    <h4 className="text-sm font-bold text-[#F4FFF9]">{tmpl.title}</h4>
                    <p className="text-xs text-[#A6B8AE] line-clamp-1">{tmpl.description}</p>
                  </div>
                  <button
                    onClick={() => handleApplyAiTemplate(tmpl)}
                    disabled={isGeneratingAi}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#050908] bg-[#00E69A] hover:bg-[#00C982] transition shrink-0"
                  >
                    Adopt Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
