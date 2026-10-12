# AloAI: Tech Interviewer

AloAI is the way to ace senior Python technical interviews, with questions curated by expert Python software engineers. Users take a placement test, get a starting level, and climb game-style locked levels with **Alo**, an AI tutor powered by Claude, who explains why each level matters, reviews every answer and awards credits.

## Stack

- **Next.js 15** (App Router) + TypeScript, Tailwind CSS v4, Framer Motion
- **Prisma + SQLite** for users, progress, attempts and credits
- Email/password auth: bcrypt hashes and a signed, httpOnly JWT session cookie (`jose`)
- **Claude API** (`@anthropic-ai/sdk`, model `claude-opus-5-5`) for Alo's level intros and answer feedback

## Run it

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then set SESSION_SECRET and ANTHROPIC_API_KEY
npm run db:setup            # creates prisma/dev.db
npm run dev                 # http://localhost:3000
```

Production: `npm run build && npm start`.

### Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file, default `file:./dev.db` |
| `SESSION_SECRET` | Random string, at least 32 characters, used to sign session cookies. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ANTHROPIC_API_KEY` | Claude API key, used server-side only |

If Claude is unavailable (no key, a network error or a refusal), the app keeps working. Alo then shows a short static intro, and the expert's reference explanation in place of personalised feedback. These fallbacks are not cached, so live text appears once a key is set.

## How it works

| Route | What it does |
|---|---|
| `/` | Animated landing page: Alo, the "curated by expert Python software engineers" message, a playable warm-up question, a level-path teaser, sign-up/log-in calls to action |
| `/signup`, `/login` | Authentication |
| `/placement` | 10-question placement test, 2 questions per level. Can only be taken once |
| `/map` | Level map: cleared, current and sealed levels, plus the credit HUD |
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
- **Answer feedback:** generated per answer, and only after the answer has been recorded, so Alo can't be used to leak answers.
- **Refusals:** requests use the API's server-side refusal fallback (`fallbacks: "default"`).

## Question content

All questions live in `content/questions.json`. That gives you 5 levels × 8 questions, plus 10 placement questions. Each question has:

```json
{ "id": "l1-q1", "prompt": "...", "code": "optional python snippet", "options": ["A", "B", "C", "D"], "answer": 1, "explanation": "expert reference explanation" }
```

`answer` is the zero-based index of the correct option. The explanation is shown as the "Expert engineer's note", and Alo grounds her feedback in it. Your expert engineers can edit or replace this file. Keep the IDs stable, because credits are tracked per question ID.
