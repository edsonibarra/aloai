# AloAI: Tech Interviewer

AloAI is the way to ace senior Python technical interviews, with questions curated by expert Python software engineers. Users take a placement test, get a starting level, and climb game-style locked levels with **Alo**, an AI tutor powered by Claude, who explains why each level matters, reviews every answer and awards credits.

## Stack

- **Next.js 15** (App Router) + TypeScript, Tailwind CSS v4, Framer Motion
- **Prisma + PostgreSQL** (e.g. Neon) for users, progress, attempts, credits and rate limits
- Email/password auth: bcrypt hashes and a signed, httpOnly JWT session cookie (`jose`)
- **Claude API** (`@anthropic-ai/sdk`, model `claude-opus-5-5`) for Alo's level intros and answer feedback

## Run it locally

You need a Postgres database. A free [Neon](https://neon.tech) project works well (use a separate branch for dev).

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # set DATABASE_URL, DIRECT_URL, SESSION_SECRET, ANTHROPIC_API_KEY
npm run db:setup            # applies migrations
npm run dev                 # http://localhost:3000
```

### Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string, used by the app at runtime |
| `DIRECT_URL` | Direct (unpooled) Postgres connection string, used by migrations |
| `SESSION_SECRET` | Random string, at least 32 characters, used to sign session cookies. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ANTHROPIC_API_KEY` | Claude API key, scoped to a workspace. Server-side only |

If Claude is unavailable (no key, a network error, a refusal, or the user's hourly limit), the app keeps working. Alo then shows a short static intro, and the expert's reference explanation in place of personalised feedback.

## Deploy to Vercel

1. **Import the repo:** in Vercel, choose *Add New → Project*, then pick `edsonibarra/aloai`. The framework preset is Next.js.
2. **Add a database:** in the project, go to *Storage → Neon (Postgres)* and connect it to *all environments*. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
3. **Set the remaining environment variables** in *Settings → Environment Variables*, for Production (and Preview if you use previews):
   - `DIRECT_URL`: the same value as `DATABASE_URL_UNPOOLED`
   - `SESSION_SECRET`: a new random value. Don't reuse the dev one.
   - `ANTHROPIC_API_KEY`: your workspace key
4. **Deploy.** The `vercel-build` script runs `prisma migrate deploy` on **production** deploys only, so preview builds never migrate the production database.
5. **Check health:** `https://<your-domain>/api/health` should return `{"status":"ok"}`. Point your uptime monitor at it.

## Production safeguards

- **Rate limits**, stored in Postgres so they hold across serverless instances (`src/lib/rate-limit.ts`):
  - 10 log-in attempts per IP + email per 15 minutes
  - 5 sign-ups per IP per hour
  - 120 Claude calls per user per hour; over the limit, Alo falls back to the expert's explanation
- **Claude spend:** each answer gets at most one feedback call, because the result is stored in `AnswerFeedback`. Level intros are generated once and shared by every user.
- **Security headers** (`next.config.ts`): CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy and Permissions-Policy.
- **Sessions:** httpOnly, `SameSite=Lax` cookies, marked `Secure` in production.

## Payments (Stripe)

Only the **placement test** is free. A one-time **Interview Pass** unlocks every level, including the user's starting level. Credits are game rewards only; they can't be bought.

**Billing stays off until `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` and `STRIPE_WEBHOOK_SECRET` are all set.** While it's off, every unlocked level stays playable and the pricing page shows "Coming soon".

**Setup**
1. **Create the product:** in the Stripe Dashboard, create a product "Interview Pass" with a one-time price. Copy the price ID (`price_...`) into `STRIPE_PRICE_ID`. To change the price later, update it in Stripe; the app re-reads it within an hour.
2. **Add the webhook:** under *Developers → Webhooks*, add an endpoint at `https://<your-domain>/api/billing/webhook`. Subscribe it to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `charge.refunded`

   Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
3. **Set the keys:** `STRIPE_SECRET_KEY`, plus `APP_URL` (your public URL) and `SUPPORT_EMAIL`. Use test keys on Preview and live keys on Production.
4. **Enable customer emails:** under *Settings → Customer emails*, turn on successful payments so buyers get receipts. Also save the default *Customer Portal* configuration so the in-app **Billing** link works.
5. **Test locally:** use the Stripe CLI, `stripe listen --forward-to localhost:3000/api/billing/webhook`, with test card `4242 4242 4242 4242`.

**How access works**
- **Only the webhook grants the Pass.** It records each Stripe event in the same transaction as its effect, so retries are no-ops. The success page only waits for that confirmation.
- **Refunds:** a full refund revokes the Pass; a partial refund keeps it.
- **Server-side checks:** every level page and level API checks both locks, progress and paywall (`src/lib/progress.ts`). Paywalled levels return `402` and redirect to `/pricing`.

**Before going live:** review `/terms` (refund window, service description) with whoever handles your legal and business terms.

## How it works

| Route | What it does |
|---|---|
| `/` | Animated landing page: Alo, the "curated by expert Python software engineers" message, a playable warm-up question, a level-path teaser, sign-up/log-in calls to action |
| `/signup`, `/login` | Authentication |
| `/placement` | 10-question placement test, 2 questions per level. Can only be taken once |
| `/map` | Level map: cleared, current, Pro (needs the Pass) and sealed levels, plus the credit HUD |
| `/pricing` | The Interview Pass; starts Stripe Checkout |
| `/billing/success` | Waits for the webhook, then plays the Pass-unlock moment |
| `/terms` | Terms and refund policy |
| `/level/[n]` | Alo's "why this level matters" briefing, 8 questions with Alo's feedback, reward moments and the level result |

**Game rules** (in `src/lib/game.ts`)

- **Placement:** you start one level above the last level whose two questions you got right, in an unbroken run from Level 1. The cap is Level 5. Levels below your start are marked cleared.
- **Passing a level:** at least 6 of 8 correct.
- **Credits:** +10 for a question and +100 for a level. Each is awarded only the first time, so replays can't farm credits.
- **Locked levels:**
  - Each level has a `LevelProgress` row only once it is unlocked.
  - Every level page and API checks for that row server-side. Locked levels redirect to the map or return 403.
  - The map never sends a locked level's title or content to the browser.

**Alo + Claude** (in `src/lib/alo.ts`)

- **Level intros:** generated once per level, then cached in the `AloIntroCache` table and shared by all users.
- **Answer feedback:** generated once per answer and stored in `AnswerFeedback`. It is only generated after the answer has been recorded, so Alo can't be used to leak answers.
- **Refusals:** requests use the API's server-side refusal fallback (`fallbacks: "default"`).

## Question content

All questions live in `content/questions.json`. That gives you 5 levels × 8 questions, plus 10 placement questions. Each question has:

```json
{ "id": "l1-q1", "prompt": "...", "code": "optional python snippet", "options": ["A", "B", "C", "D"], "answer": 1, "explanation": "expert reference explanation" }
```

`answer` is the zero-based index of the correct option. The explanation is shown as the "Expert engineer's note", and Alo grounds her feedback in it. Your expert engineers can edit or replace this file. Keep the IDs stable, because credits are tracked per question ID.
