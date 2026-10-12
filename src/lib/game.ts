/** Game rules shared by the server routes and the UI copy. */
export const CREDITS_PER_QUESTION = 10;
export const CREDITS_PER_LEVEL = 100;
export const PASS_THRESHOLD = 6; // correct answers needed out of each level's questions

export type AttemptAnswers = Record<string, { choice: number; correct: boolean }>;

/**
 * Placement: the user starts one level above the highest level they cleared
 * (both questions correct) in an unbroken run from Level 1, capped at the last level.
 */
export function startLevelFromPlacement(
  results: { level: number; correct: boolean }[],
  levelCount: number,
): number {
  let cleared = 0;
  for (let level = 1; level <= levelCount; level++) {
    const forLevel = results.filter((r) => r.level === level);
    if (forLevel.length > 0 && forLevel.every((r) => r.correct)) cleared = level;
    else break;
  }
  return Math.min(cleared + 1, levelCount);
}

/** Seniority label shown after placement, indexed by starting level. */
export const SENIORITY_BY_START_LEVEL: Record<number, string> = {
  1: "Mid-level",
  2: "Strong mid-level",
  3: "Emerging senior",
  4: "Senior",
  5: "Senior+",
};
