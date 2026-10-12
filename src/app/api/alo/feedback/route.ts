import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getLevel } from "@/lib/content";
import { generateAnswerFeedback } from "@/lib/alo";
import { consume, LIMITS } from "@/lib/rate-limit";
import type { AttemptAnswers } from "@/lib/game";

const schema = z.object({ attemptId: z.string(), questionId: z.string() });

/**
 * Alo's personalised feedback for an answer the user has already submitted in this attempt.
 * Stored per answer, so each answer costs at most one Claude call.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { attemptId, questionId } = parsed.data;

  const attempt = await prisma.levelAttempt.findFirst({ where: { id: attemptId, userId: user.id } });
  const level = attempt ? getLevel(attempt.level) : undefined;
  const question = level?.questions.find((q) => q.id === questionId);
  const answer = attempt ? (JSON.parse(attempt.answers) as AttemptAnswers)[questionId] : undefined;
  if (!level || !question || !answer) {
    return NextResponse.json({ error: "Answer not found" }, { status: 404 });
  }

  const stored = await prisma.answerFeedback.findUnique({
    where: { attemptId_questionId: { attemptId, questionId } },
  });
  if (stored) return NextResponse.json({ text: stored.text, live: true });

  // Over the hourly Claude budget: the client falls back to the expert's explanation.
  if (!(await consume(`alo:${user.id}`, LIMITS.alo))) {
    return NextResponse.json({ text: null, live: false });
  }

  const text = await generateAnswerFeedback(question, answer.choice, level.title);
  if (text) {
    await prisma.answerFeedback.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      create: { attemptId, questionId, text },
      update: {},
    });
  }
  return NextResponse.json({ text, live: text !== null });
}
