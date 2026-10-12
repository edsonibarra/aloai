import "server-only";
import { prisma } from "./db";

export type LevelStatus = "locked" | "unlocked" | "completed";

export async function getLevelStatuses(userId: string): Promise<Map<number, LevelStatus>> {
  const rows = await prisma.levelProgress.findMany({ where: { userId } });
  return new Map(rows.map((r) => [r.level, r.status as LevelStatus]));
}

/** A level is accessible only if a progress row exists (it was unlocked by placement or by completing the previous level). */
export async function canAccessLevel(userId: string, level: number): Promise<boolean> {
  const row = await prisma.levelProgress.findUnique({
    where: { userId_level: { userId, level } },
  });
  return row !== null;
}
