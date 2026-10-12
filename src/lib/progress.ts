import "server-only";
import { prisma } from "./db";
import { billingEnabled, hasPass } from "./billing";

export type LevelStatus = "locked" | "unlocked" | "completed";

export async function getLevelStatuses(userId: string): Promise<Map<number, LevelStatus>> {
  const rows = await prisma.levelProgress.findMany({ where: { userId } });
  return new Map(rows.map((r) => [r.level, r.status as LevelStatus]));
}

/**
 * Whether a user may play a level. Two independent locks:
 * 1. Progress: the level must be unlocked (a LevelProgress row exists).
 * 2. Paywall: every level needs the Interview Pass. Only the placement test is free.
 */
export type LevelAccess = "locked" | "paywalled" | "playable";

/** The paywall: true when billing is off or the user owns the Interview Pass. */
export async function canPlayLevels(user: { id: string }): Promise<boolean> {
  return !billingEnabled() || (await hasPass(user.id));
}

export async function getLevelAccess(
  user: { id: string },
  level: number,
): Promise<LevelAccess> {
  const row = await prisma.levelProgress.findUnique({
    where: { userId_level: { userId: user.id, level } },
  });
  if (!row) return "locked";
  return (await canPlayLevels(user)) ? "playable" : "paywalled";
}
