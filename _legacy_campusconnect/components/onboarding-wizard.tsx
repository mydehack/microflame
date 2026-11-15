"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Compass,
  Target,
  Wrench,
  Users,
  Building,
  CheckCircle2,
  Plus,
  Flame,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { ConEdStore, INITIAL_STUDENTS, INITIAL_COMMUNITIES, type StudentProfile } from "@/lib/coned-store";
import { ConedLogo } from "@/components/coned-logo";

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Interests", icon: Compass },
  { id: 3, title: "Goals", icon: Target },
  { id: 4, title: "Skills", icon: Wrench },
  { id: 5, title: "People", icon: Users },
  { id: 6, title: "Communities", icon: Building },
  { id: 7, title: "Completion", icon: CheckCircle2 },
];

const INTEREST_OPTIONS = [
  "Programming",
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Web Development",
  "App Development",
  "UI/UX Design",
  "Robotics",
  "Cybersecurity",
  "Business",
  "Entrepreneurship",
  "Gaming",
  "Photography",
  "Science & Physics",
  "Finance & FinTech",
  "Open Source",
];

const GOAL_OPTIONS = [
  "Learn programming",
  "Find friends with similar interests",
  "Build collaborative projects",
  "Prepare for placements & FAANG",
  "Find high-impact internships",
  "Improve technical communication",
  "Build a venture-backed startup",
  "Master LLMs & Generative AI",
  "Participate in hackathons",
  "Improve academic grades & research",
  "Develop leadership & soft skills",
];

interface OnboardingWizardProps {
  college?: string;
  studentName?: string;
}

export function OnboardingWizard({ college: initialCollege = "Stanford University", studentName = "Alex Rivera" }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Personal Info
  const [fullName, setFullName] = useState(studentName);
  const [college, setCollege] = useState(initialCollege);
  const [degree, setDegree] = useState("B.S. Computer Science");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [academicYear, setAcademicYear] = useState(3);
  const [location, setLocation] = useState("San Francisco Bay Area, CA");

  // Step 2: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Programming",
    "Artificial Intelligence",
    "Web Development",
    "Robotics",
  ]);
  const [customInterest, setCustomInterest] = useState("");

  // Step 3: Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Master LLMs & Generative AI",
    "Build collaborative projects",
    "Prepare for placements & FAANG",
  ]);
  const [customGoal, setCustomGoal] = useState("");

  // Step 4: Skills
  const [skills, setSkills] = useState<Array<{ name: string; level: "Beginner" | "Intermediate" | "Advanced" }>>([
    { name: "Python", level: "Advanced" },
    { name: "TypeScript", level: "Advanced" },
    { name: "Next.js & React", level: "Intermediate" },
    { name: "Machine Learning", level: "Intermediate" },
  ]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");

  // Step 5: Followed Students
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set(["usr_coned_ai"]));

  // Step 6: Joined Communities
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<Set<string>>(new Set(["comm_ai_world"]));

  // Step 7: Finishing
  const [isFinishing, setIsFinishing] = useState(false);

  // Handlers
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests([...selectedInterests, customInterest.trim()]);
      setCustomInterest("");
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleAddCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      setSelectedGoals([...selectedGoals, customGoal.trim()]);
      setCustomGoal("");
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillName.trim()) {
      setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
      setNewSkillName("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const toggleFollow = (id: string) => {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleJoinCommunity = (id: string) => {
    setJoinedCommunityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFinishOnboarding = () => {
    setIsFinishing(true);

    // Save profile to ConEdStore
    ConEdStore.setCurrentUser({
      fullName,
      college,
      department,
      academicYear,
      interests: selectedInterests,
      goals: selectedGoals,
      skills: skills.map((s) => ({ name: s.name, level: s.level })),
    });

    // Make async call to backend api/onboarding if available
    fetch("/api/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName,
        college,
        degree,
        department,
        academicYear,
        location,
        interests: selectedInterests,
        goals: selectedGoals,
        skills,
      }),
    }).catch(() => {});

    setTimeout(() => {
      router.push("/home");
      router.refresh();
    }, 1000);
  };

  const candidateStudents = INITIAL_STUDENTS.slice(0, 4);
  const candidateCommunities = INITIAL_COMMUNITIES.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#050908] text-[#F4FFF9] flex flex-col justify-between py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Branding */}
        <div className="flex items-center justify-between">
          <ConedLogo size="md" />
          <div className="text-xs font-semibold text-[#A6B8AE] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E69A]" />
            Intelligent Student Setup
          </div>
        </div>

        {/* 7-Step Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#A6B8AE]">
            <span>Step {currentStep} of 7: {STEPS[currentStep - 1].title}</span>
            <span className="text-[#00E69A]">{Math.round((currentStep / 7) * 100)}% Complete</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 h-1.5 w-full bg-[#101916] rounded-full overflow-hidden border border-[#23372D]">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-full transition-all duration-300 ${
                  s.id <= currentStep ? "bg-[#00E69A]" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card */}
        <div className="rounded-3xl bg-[#101916] border border-[#23372D] p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* STEP 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E69A] block mb-1">
                  Pillar 1 — Identity
                </span>
                <h2 className="text-2xl font-black text-[#F4FFF9]">Tell us about your academic context</h2>
                <p className="text-xs text-[#A6B8AE] mt-1">
                  This helps CON-ED match you with peers in your department, university, and year.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">College or University *</label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">Degree / Program</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">Department / Major</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(Number(e.target.value))}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                    <option value={5}>Graduate / Masters / PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">Location (Optional)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Interests */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E69A] block mb-1">
                  Pillar 2 — Discover
                </span>
                <h2 className="text-2xl font-black text-[#F4FFF9]">What are you interested in?</h2>
                <p className="text-xs text-[#A6B8AE] mt-1">
                  Select subjects you care about or want to study. We use this to curate your feed and peer network.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                        isSelected
                          ? "bg-[#00E69A] text-[#050908] border-[#00E69A] shadow-[0_0_15px_rgba(0,230,154,0.3)] font-bold"
                          : "bg-[#080F0D] text-[#A6B8AE] border-[#23372D] hover:border-[#00D995]/50 hover:text-[#F4FFF9]"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add other custom interest..."
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  className="flex-1 bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomInterest}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#18251F] text-[#00E69A] border border-[#23372D] hover:border-[#00D995]"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Goals */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E69A] block mb-1">
                  Pillar 5 — Achieve
                </span>
                <h2 className="text-2xl font-black text-[#F4FFF9]">What do you want to accomplish?</h2>
                <p className="text-xs text-[#A6B8AE] mt-1">
                  Your goals guide CON-ED AI's weekly action suggestions and project recommendations.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                {GOAL_OPTIONS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`p-3.5 rounded-xl text-left text-xs transition border flex items-center justify-between ${
                        isSelected
                          ? "bg-[#18251F] text-[#00E69A] border-[#00D995] font-bold"
                          : "bg-[#080F0D] text-[#A6B8AE] border-[#23372D] hover:border-[#71857A]"
                      }`}
                    >
                      <span>{goal}</span>
                      {isSelected && <Check size={14} className="text-[#00E69A] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Goal */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom ambition..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="flex-1 bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomGoal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#18251F] text-[#00E69A] border border-[#23372D] hover:border-[#00D995]"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Skills */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E69A] block mb-1">
                  Pillar 4 — Grow
                </span>
                <h2 className="text-2xl font-black text-[#F4FFF9]">Add your skills and proficiency</h2>
                <p className="text-xs text-[#A6B8AE] mt-1">
                  Mark what you know and your level. You can update and expand these at any time.
                </p>
              </div>

              {/* Existing Skills List */}
              <div className="grid sm:grid-cols-2 gap-3">
                {skills.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#080F0D] border border-[#23372D] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#F4FFF9] block">{s.name}</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          s.level === "Advanced"
                            ? "text-[#00E69A]"
                            : s.level === "Intermediate"
                            ? "text-[#67F5B8]"
                            : "text-[#71857A]"
                        }`}
                      >
                        {s.level}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-[#71857A] hover:text-[#FF5364] text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Skill Input */}
              <div className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D] space-y-3">
                <span className="text-xs font-bold text-[#F4FFF9] block">Add a New Skill</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="e.g. PyTorch, Rust, Docker, Figma..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 bg-[#101916] border border-[#23372D] rounded-xl px-3.5 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as any)}
                    className="bg-[#101916] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00E69A] text-[#050908] hover:bg-[#00C982]"
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: People Recommendations */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E69A] block mb-1">
                  Pillar 1 — Connect
                </span>
                <h2 className="text-2xl font-black text-[#F4FFF9]">Suggested student peers for you</h2>
                <p className="text-xs text-[#A6B8AE] mt-1">
                  Calculated based on shared interests, career goals, and matching technical roadmaps.
                </p>
              </div>

              <div className="space-y-3">
                {candidateStudents.map((student) => {
                  const isFollowed = followedIds.has(student.id);
                  return (
                    <div
                      key={student.id}
                      className="p-4 rounded-2xl bg-[#080F0D] border border-[#23372D] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={student.avatarUrl}
                          alt={student.fullName}
                          className="w-11 h-11 rounded-full object-cover border border-[#23372D]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#F4FFF9] truncate">{student.fullName}</span>
                            {student.isPlatformBadge && (
                              <span className="text-[9px] bg-[#00E69A]/20 text-[#00E69A] px-1.5 py-0.2 rounded font-bold">
                                Official
                              </span>
                            )}
                            <span className="text-[10px] text-[#00E69A] font-bold">
                              {student.stats.compatibilityScore || 94}% Match
                            </span>
                          </div>
                          <span className="text-[11px] text-[#71857A] truncate block">
                            {student.college} • {student.department}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFollow(student.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                          isFollowed
                            ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/40"
                            : "bg-[#00E69A] text-[#050908] hover:bg-[#00C982]"
                        }`}
                      >
                        {isFollowed ? "Following" : "+ Follow"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Recommended Communities */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E69A] block mb-1">
                  Pillar 3 — Share & Collaborate
                </span>
                <h2 className="text-2xl font-black text-[#F4FFF9]">Join relevant student communities</h2>
                <p className="text-xs text-[#A6B8AE] mt-1">
                  Communities provide discussion threads, peer code reviews, hackathon teams, and resource sharing.
                </p>
              </div>

              <div className="space-y-3">
                {candidateCommunities.map((comm) => {
                  const isJoined = joinedCommunityIds.has(comm.id);
                  return (
                    <div
                      key={comm.id}
                      className="p-4 rounded-2xl bg-[#080F0D] border border-[#23372D] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={comm.logoUrl}
                          alt={comm.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-[#23372D]"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#F4FFF9] truncate">{comm.name}</h4>
                          <p className="text-[11px] text-[#71857A] line-clamp-1">{comm.description}</p>
                          <span className="text-[10px] text-[#00E69A] font-semibold">
                            {comm.membersCount.toLocaleString()} student members
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleJoinCommunity(comm.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                          isJoined
                            ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/40"
                            : "bg-[#00E69A] text-[#050908] hover:bg-[#00C982]"
                        }`}
                      >
                        {isJoined ? "Joined" : "Join"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Completion */}
          {currentStep === 7 && (
            <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#00E69A] to-[#008F62] p-0.5 mx-auto shadow-[0_0_40px_rgba(0,230,154,0.35)]">
                <div className="w-full h-full rounded-[22px] bg-[#050908] flex items-center justify-center">
                  <GraduationCap size={36} className="text-[#00E69A]" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#00E69A]">
                  Setup Complete • Welcome to CON-ED
                </span>
                <h2 className="text-3xl font-black text-[#F4FFF9]">
                  You're all set, {fullName}!
                </h2>
                <p className="text-xs text-[#A6B8AE] max-w-md mx-auto leading-relaxed">
                  Your personalized profile is active. Official platform account <strong className="text-[#00E69A]">CON-ED AI</strong> has automatically followed you to guide your learning roadmaps and introduce daily opportunities.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#080F0D] border border-[#23372D] max-w-md mx-auto text-left space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F4FFF9]">
                  <Sparkles size={15} className="text-[#00E69A]" />
                  Your Configured Ecosystem:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A6B8AE]">
                  <div>• Campus: <span className="text-[#F4FFF9] font-medium">{college}</span></div>
                  <div>• Major: <span className="text-[#F4FFF9] font-medium">{department}</span></div>
                  <div>• Interests: <span className="text-[#00E69A] font-medium">{selectedInterests.length} selected</span></div>
                  <div>• Goals: <span className="text-[#00E69A] font-medium">{selectedGoals.length} tracked</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#23372D]/60 mt-8">
            {currentStep > 1 && currentStep < 7 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#A6B8AE] hover:text-[#F4FFF9] transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 shadow-[0_0_20px_rgba(0,230,154,0.3)] transition"
              >
                Continue
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isFinishing}
                onClick={handleFinishOnboarding}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 shadow-[0_0_25px_rgba(0,230,154,0.4)] transition"
              >
                {isFinishing ? "Launching Ecosystem..." : "Enter CON-ED Feed"}
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#71857A] pt-6">
        CON-ED Intelligent Student Social Networking Ecosystem • Connect • Learn • Grow
      </div>
    </div>
  );
}
