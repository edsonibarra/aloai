import "server-only";
import { headers } from "next/headers";
import { prisma } from "./db";

export type Limit = { max: number; windowSeconds: number };

export const LIMITS = {
  login: { max: 10, windowSeconds: 15 * 60 }, // per IP + email
  signup: { max: 5, windowSeconds: 60 * 60 }, // per IP
  alo: { max: 120, windowSeconds: 60 * 60 }, // Claude calls per user
  checkout: { max: 10, windowSeconds: 60 * 60 }, // Stripe Checkout sessions per user
} satisfies Record<string, Limit>;

/**
 * Fixed-window counter stored in Postgres, so it holds across serverless instances.
 * Returns true if the call is allowed (and counts it).
 */
export async function consume(key: string, { max, windowSeconds }: Limit): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "windowStart", "count")
    VALUES (${key}, NOW(), 1)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimit"."windowStart" < NOW() - make_interval(secs => ${windowSeconds}) THEN 1
        ELSE "RateLimit"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimit"."windowStart" < NOW() - make_interval(secs => ${windowSeconds}) THEN NOW()
        ELSE "RateLimit"."windowStart"
      END
    RETURNING "count"`;
  return (rows[0]?.count ?? 0) <= max;
}

/** Client IP as reported by the platform proxy (Vercel sets x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
