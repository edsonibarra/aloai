import "server-only";
import data from "../../content/questions.json";

export type Question = {
  id: string;
  prompt: string;
  code: string | null;
  options: string[];
  answer: number;
  explanation: string;
};

export type PlacementQuestion = Question & { level: number };

export type Level = {
  id: number;
  title: string;
  tagline: string;
  topics: string[];
  questions: Question[];
};

/** A question as sent to the browser: never includes the answer or explanation. */
export type PublicQuestion = Pick<Question, "id" | "prompt" | "code" | "options">;

const levels = data.levels as Level[];
const placement = data.placement as PlacementQuestion[];

export const LEVEL_COUNT = levels.length;

export function getLevels(): Level[] {
  return levels;
}

export function getLevel(id: number): Level | undefined {
  return levels.find((l) => l.id === id);
}

export function getPlacement(): PlacementQuestion[] {
  return placement;
}

export function findQuestion(id: string): { question: Question; level: number } | undefined {
  for (const level of levels) {
    const question = level.questions.find((q) => q.id === id);
    if (question) return { question, level: level.id };
  }
  const p = placement.find((q) => q.id === id);
  return p ? { question: p, level: p.level } : undefined;
}

export function toPublic(q: Question): PublicQuestion {
  return { id: q.id, prompt: q.prompt, code: q.code, options: q.options };
}
