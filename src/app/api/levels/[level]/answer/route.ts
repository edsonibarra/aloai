import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getLevel, LEVEL_COUNT } from "@/lib/content";
import { getLevelAccess, paywallFor } from "@/lib/progress";
import { CREDITS_PER_LEVEL, CREDITS_PER_QUESTION, PASS_THRESHOLD, type AttemptAnswers } from "@/lib/game";

const schema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  choice: z.number().int().min(0),
});

export async function POST(req: Request, { params }: { params: Promise<{ level: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const levelId = Number((await params).level);
  const level = getLevel(levelId);
  const access = level ? await getLevelAccess(user, levelId) : "locked";
  if (!level || access === "locked") return NextResponse.json({ error: "Level locked" }, { status: 403 });
  if (access === "paywalled") {
    return NextResponse.json({ error: "This level needs the Interview Pass" }, { status: 402 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  const { attemptId, questionId, choice } = parsed.data;

  const question = level.questions.find((q) => q.id === questionId);
  if (!question || choice >= question.options.length) {
    return NextResponse.json({ error: "Unknown question" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const attempt = await tx.levelAttempt.findFirst({
      where: { id: attemptId, userId: user.id, level: levelId, finished: false },
    });
    if (!attempt) return { error: "Attempt not found or already finished" } as const;

    const answers = JSON.parse(attempt.answers) as AttemptAnswers;
    if (answers[questionId]) return { error: "Question already answered" } as const;

    const correct = choice === question.answer;
    answers[questionId] = { choice, correct };

    // Credits for a question are awarded only the first time the user passes it.
    let questionCredits = 0;
    if (correct) {
      const already = await tx.questionCredit.findUnique({
        where: { userId_questionId: { userId: user.id, questionId } },
      });
      if (!already) {
        await tx.questionCredit.create({ data: { userId: user.id, questionId } });
        questionCredits = CREDITS_PER_QUESTION;
      }
    }

    const answeredCount = Object.keys(answers).length;
    const finished = answeredCount === level.questions.length;
    const score = Object.values(answers).filter((a) => a.correct).length;
    const passed = finished && score >= PASS_THRESHOLD;

    let levelCredits = 0;
    let unlockedLevel: number | null = null;
    if (finished) {
      const progress = await tx.levelProgress.findUniqueOrThrow({
        where: { userId_level: { userId: user.id, level: levelId } },
      });
      const firstCompletion = passed && progress.status !== "completed";
      await tx.levelProgress.update({
        where: { id: progress.id },
        data: {
          bestScore: Math.max(progress.bestScore, score),
          ...(passed ? { status: "completed" } : {}),
        },
      });
      if (firstCompletion) levelCredits = CREDITS_PER_LEVEL;
      if (passed && levelId < LEVEL_COUNT) {
        await tx.levelProgress.upsert({
          where: { userId_level: { userId: user.id, level: levelId + 1 } },
          create: { userId: user.id, level: levelId + 1, status: "unlocked" },
          update: {},
        });
        unlockedLevel = levelId + 1;
      }
    }

    await tx.levelAttempt.update({
      where: { id: attempt.id },
      data: { answers: JSON.stringify(answers), finished, passed },
    });
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { credits: { increment: questionCredits + levelCredits } },
    });

    return {
      correct,
      correctIndex: question.answer,
      explanation: question.explanation,
      questionCredits,
      totalCredits: updatedUser.credits,
      levelResult: finished
        ? {
            score,
            total: level.questions.length,
            passed,
            levelCredits,
            unlockedLevel,
            isFinalLevel: levelId === LEVEL_COUNT,
          }
        : null,
    };
  });

  if ("error" in result) return NextResponse.json(result, { status: 409 });
  if (result.levelResult?.unlockedLevel) {
    const allowed = await paywallFor(user);
    return NextResponse.json({
      ...result,
      levelResult: { ...result.levelResult, nextPlayable: allowed(result.levelResult.unlockedLevel) },
    });
  }
  return NextResponse.json(result);
}
