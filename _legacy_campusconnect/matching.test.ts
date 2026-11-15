import { describe, expect, it } from "vitest";
import { rankStudentMatches, type MatchProfile } from "@/lib/matching";

const base: MatchProfile = {
  id: "me", discoverable: true, college: "North College", degree: "B.Tech", specialization: "AI & ML", academicYear: 2,
  goals: ["build AI projects"], interests: ["machine learning", "robotics"], currentSkills: ["python"], desiredSkills: ["computer vision"], collaborationTypes: ["project teammate"],
};

describe("rankStudentMatches", () => {
  it("ranks real shared goals, interests, education and complementary skills", () => {
    const strong: MatchProfile = {
      ...base, id: "strong", goals: ["build AI projects"], interests: ["robotics", "machine learning"],
      currentSkills: ["computer vision"], desiredSkills: ["python"], collaborationTypes: ["project teammate"],
    };
    const weak: MatchProfile = { ...base, id: "weak", college: "Other", degree: "B.Com", specialization: "Finance", goals: ["start a bakery"], interests: ["music"], currentSkills: [], desiredSkills: [], collaborationTypes: [] };
    const results = rankStudentMatches(base, [weak, strong]);
    expect(results.map((item) => item.profile.id)).toEqual(["strong"]);
    expect(results[0]?.score).toBeGreaterThan(80);
    expect(results[0]?.explanation).toContain("goals");
    expect(results[0]?.complementarySkills).toContain("computer vision");
  });

  it("never recommends blocked, dismissed, private, followed, self, or AI profiles", () => {
    const excluded = [
      { ...base, id: "self" },
      { ...base, id: "blocked", blocked: true },
      { ...base, id: "dismissed", dismissed: true },
      { ...base, id: "private", discoverable: false },
      { ...base, id: "followed", alreadyFollowing: true },
      { ...base, id: "mentor", accountType: "ai" },
    ] satisfies MatchProfile[];
    expect(rankStudentMatches(base, excluded)).toEqual([]);
  });

  it("orders candidates by score and applies its result limit", () => {
    const candidate = { ...base, id: "same" };
    expect(rankStudentMatches(base, [{ ...candidate, id: "two" }, { ...candidate, id: "one" }], 1)).toHaveLength(1);
  });
});
