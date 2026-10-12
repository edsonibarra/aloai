import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Level, Question } from "./content";

const MODEL = "claude-opus-5-5";

const ALO_PERSONA = `You are Alo, the AI tutor inside AloAI, a game-style app that prepares software engineers for senior-level Python technical interviews. The questions in the app are curated by expert Python software engineers.

Your voice: warm, confident, encouraging, and precise, like a senior engineer who has sat on many interview panels and wants the learner to win. You speak in the first person, directly to the learner ("you").

Write plain prose only: no markdown headings, bullet lists, bold, or emoji. You may wrap short code identifiers in single backticks, like \`__slots__\`. Never invent facts about Python; when unsure, stay general.`;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

async function ask(prompt: string, effort: "low" | "medium"): Promise<string | null> {
  try {
    const response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort },
      system: ALO_PERSONA,
      messages: [{ role: "user", content: prompt }],
    });
    if (response.stop_reason === "refusal") return null;
    const text = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim();
    return text || null;
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("[alo] Claude API authentication failed. Is ANTHROPIC_API_KEY set?");
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error("[alo] Claude API rate limited");
    } else if (error instanceof Anthropic.APIError) {
      console.error(`[alo] Claude API error ${error.status}: ${error.message}`);
    } else {
      console.error("[alo] Could not reach Claude:", error);
    }
    return null;
  }
}

/** Alo explains why this level matters to senior interviewers. Returns null if Claude is unavailable. */
export function generateLevelIntro(level: Level): Promise<string | null> {
  const prompt = `The learner is about to start Level ${level.id}: "${level.title}" (${level.tagline}).
Topics covered: ${level.topics.join(", ")}.

Write Alo's level introduction in 90 to 130 words. Explain why a senior Python engineer must master this content: what senior interviewers are really probing for with these topics, and how weak answers here reveal a mid-level engineer. Make it concrete with one or two real-world consequences (production bugs, performance, design). End with one short, energizing line that kicks off the level. Do not list the questions.`;
  return ask(prompt, "medium");
}

/** Alo's personalised feedback on a single answer. Returns null if Claude is unavailable. */
export function generateAnswerFeedback(
  question: Question,
  choice: number,
  levelTitle: string,
): Promise<string | null> {
  const correct = choice === question.answer;
  const options = question.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join("\n");
  const prompt = `Level: ${levelTitle}
Question: ${question.prompt}
${question.code ? `Code:\n${question.code}\n` : ""}Options:
${options}

Correct answer: ${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}
The learner chose: ${String.fromCharCode(65 + choice)}. ${question.options[choice]} (${correct ? "correct" : "incorrect"})
Reference explanation from the expert who curated this question: ${question.explanation}

Write Alo's feedback in 40 to 75 words. ${
    correct
      ? "Briefly celebrate, then deepen their understanding with the key insight and one way a senior candidate would articulate it in an interview."
      : "Be kind but direct. Name the misconception behind their specific choice, explain the correct behaviour, and give one tip for remembering it."
  } Stay consistent with the reference explanation.`;
  return ask(prompt, "low");
}
