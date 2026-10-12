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
 * 2. Paywall: the user's starting level is free; every other level needs the Interview Pass.
 */
export type LevelAccess = "locked" | "paywalled" | "playable";

export function isFreeLevel(startLevel: number | null, level: number): boolean {
  return startLevel !== null && level === startLevel;
}

/** Resolves the paywall once per request, for checking several levels. */
export async function paywallFor(user: { id: string; startLevel: number | null }) {
  const unrestricted = !billingEnabled() || (await hasPass(user.id));
  return (level: number) => unrestricted || isFreeLevel(user.startLevel, level);
}

export async function getLevelAccess(
  user: { id: string; startLevel: number | null },
  level: number,
): Promise<LevelAccess> {
  const row = await prisma.levelProgress.findUnique({
    where: { userId_level: { userId: user.id, level } },
  });
  if (!row) return "locked";
  const allowed = await paywallFor(user);
  return allowed(level) ? "playable" : "paywalled";
}
