export const MATCH_WEIGHTS = {
  goals: 0.3,
  interests: 0.25,
  education: 0.2,
  skills: 0.15,
  collaboration: 0.1,
} as const;

export type MatchProfile = {
  id: string;
  accountType?: "student" | "ai";
  discoverable: boolean;
  dismissed?: boolean;
  blocked?: boolean;
  alreadyFollowing?: boolean;
  college?: string;
  degree?: string;
  specialization?: string;
  academicYear?: number | null;
  goals: string[];
  interests: string[];
  currentSkills: string[];
  desiredSkills: string[];
  collaborationTypes: string[];
};

export type MatchResult = {
  profile: MatchProfile;
  score: number;
  explanation: string;
  sharedInterests: string[];
  complementarySkills: string[];
};

function normalize(values: string[]) {
  return [...new Set(values.map((value) => value.trim().toLocaleLowerCase()).filter(Boolean))];
}

function similarity(a: string[], b: string[]) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right);
  const overlap = left.filter((value) => rightSet.has(value)).length;
  return overlap / Math.max(left.length, right.length);
}

const stopWords = new Set(["a", "an", "and", "for", "in", "of", "on", "the", "to", "with", "my", "become", "build", "learn", "want"]);
function goalKeywords(values: string[]) {
  return new Set(values.flatMap((value) => value.toLocaleLowerCase().match(/[a-z0-9+#.]{2,}/g) ?? []).filter((word) => !stopWords.has(word)));
}
function goalSimilarity(a: string[], b: string[]) {
  const left = goalKeywords(a);
  const right = goalKeywords(b);
  if (!left.size || !right.size) return 0;
  const overlap = [...left].filter((word) => right.has(word)).length;
  return overlap / Math.max(left.size, right.size);
}

function educationSimilarity(a: MatchProfile, b: MatchProfile) {
  let possible = 0;
  let score = 0;
  const compare = (left: string | undefined, right: string | undefined, weight: number) => {
    if (!left || !right) return;
    possible += weight;
    if (left.trim().toLocaleLowerCase() === right.trim().toLocaleLowerCase()) score += weight;
  };
  compare(a.college, b.college, 0.35);
  compare(a.degree, b.degree, 0.2);
  compare(a.specialization, b.specialization, 0.3);
  if (a.academicYear != null && b.academicYear != null) {
    possible += 0.15;
    if (a.academicYear === b.academicYear) score += 0.15;
  }
  return possible ? score / possible : 0;
}

function complementarySkills(a: MatchProfile, b: MatchProfile) {
  const aCurrent = new Set(normalize(a.currentSkills));
  const bCurrent = new Set(normalize(b.currentSkills));
  const aDesired = normalize(a.desiredSkills);
  const bDesired = normalize(b.desiredSkills);
  const matches = [
    ...aDesired.filter((skill) => bCurrent.has(skill)),
    ...bDesired.filter((skill) => aCurrent.has(skill)),
  ];
  const distinctDesired = new Set([...aDesired, ...bDesired]);
  return {
    matches: [...new Set(matches)],
    score: distinctDesired.size ? new Set(matches).size / distinctDesired.size : 0,
  };
}

export function rankStudentMatches(me: MatchProfile, candidates: MatchProfile[], limit = 12): MatchResult[] {
  return candidates
    .filter((candidate) => candidate.id !== me.id)
    .filter((candidate) => candidate.accountType !== "ai" && candidate.discoverable && !candidate.dismissed && !candidate.blocked && !candidate.alreadyFollowing)
    .map((candidate) => {
      const goals = Math.max(similarity(me.goals, candidate.goals), goalSimilarity(me.goals, candidate.goals));
      const interests = similarity(me.interests, candidate.interests);
      const education = educationSimilarity(me, candidate);
      const skillFit = complementarySkills(me, candidate);
      const collaboration = similarity(me.collaborationTypes, candidate.collaborationTypes);
      const raw = goals * MATCH_WEIGHTS.goals + interests * MATCH_WEIGHTS.interests + education * MATCH_WEIGHTS.education + skillFit.score * MATCH_WEIGHTS.skills + collaboration * MATCH_WEIGHTS.collaboration;
      const reasons = [
        { score: goals * MATCH_WEIGHTS.goals, label: `similar goals: ${[...goalKeywords(me.goals)].find((goal) => goalKeywords(candidate.goals).has(goal)) ?? "shared direction"}` },
        { score: interests * MATCH_WEIGHTS.interests, label: `shared interest: ${normalize(me.interests).find((interest) => normalize(candidate.interests).includes(interest)) ?? "similar interests"}` },
        { score: education * MATCH_WEIGHTS.education, label: "similar education background" },
        { score: skillFit.score * MATCH_WEIGHTS.skills, label: `complementary skills: ${skillFit.matches[0] ?? "skills"}` },
        { score: collaboration * MATCH_WEIGHTS.collaboration, label: "similar collaboration preferences" },
      ].sort((a, b) => b.score - a.score);
      return {
        profile: candidate,
        score: Math.round(raw * 100),
        explanation: reasons[0]!.score > 0 ? `You may connect over ${reasons[0]!.label}.` : "Your profiles have some shared ground.",
        sharedInterests: normalize(me.interests).filter((interest) => normalize(candidate.interests).includes(interest)),
        complementarySkills: skillFit.matches,
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.profile.id.localeCompare(b.profile.id))
    .slice(0, limit);
}
