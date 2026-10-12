import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getLevel } from "@/lib/content";
import { generateAnswerFeedback } from "@/lib/alo";
import type { AttemptAnswers } from "@/lib/game";

const schema = z.object({ attemptId: z.string(), questionId: z.string() });

/** Alo's personalised feedback for an answer the user has already submitted in this attempt. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const attempt = await prisma.levelAttempt.findFirst({
    where: { id: parsed.data.attemptId, userId: user.id },
  });
  const level = attempt ? getLevel(attempt.level) : undefined;
  const question = level?.questions.find((q) => q.id === parsed.data.questionId);
  const answer = attempt ? (JSON.parse(attempt.answers) as AttemptAnswers)[parsed.data.questionId] : undefined;
  if (!level || !question || !answer) {
    return NextResponse.json({ error: "Answer not found" }, { status: 404 });
  }

  const text = await generateAnswerFeedback(question, answer.choice, level.title);
  return NextResponse.json({ text, live: text !== null });
}
