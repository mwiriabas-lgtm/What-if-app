# What If? — AI Scenario Simulator

A full-stack Next.js app: ask any hypothetical question, get a structured AI
prediction (explanation, timeline, chart, confidence score, fun fact), an
optional AI-generated image, and a shareable card — plus a community feed,
profiles, XP/streaks/badges, and a free/premium tier.

---

## 1. Architecture

```
Next.js 14 (App Router)
├─ Frontend: React Server + Client Components, Tailwind CSS
├─ Backend: Next.js Route Handlers (src/app/api/**)
├─ Database: Postgres via Prisma ORM
├─ Auth: NextAuth.js (Google OAuth + email/password credentials)
├─ AI text: Anthropic Claude API (src/lib/simulation-engine.ts)
├─ AI images: OpenAI Images API → stored in Vercel Blob (src/lib/image-gen.ts)
└─ Deployment: Vercel
```

### Why this stack
- **Next.js App Router** gives you frontend + backend in one deployable unit —
  no separate API server to host or CORS to configure.
- **Prisma + Postgres** is the most portable relational setup; works
  identically against Vercel Postgres, Neon, or Supabase.
- **NextAuth** handles OAuth + session cookies correctly out of the box,
  which is easy to get subtly wrong by hand.
- **Claude API** powers the simulation engine with a strict JSON schema
  (validated with `zod`) so the frontend never receives malformed data.

---

## 2. Folder structure

```
whatif-app/
├─ prisma/
│  └─ schema.prisma           # Users, simulations, likes, saves, badges, auth tables
├─ scripts/
│  └─ seed.ts                 # Seeds badge definitions
├─ public/
│  └─ manifest.json           # PWA manifest (add-to-homescreen)
├─ src/
│  ├─ app/
│  │  ├─ page.tsx             # Home (search, trending, suggested)
│  │  ├─ HomeClient.tsx       # Home page client logic
│  │  ├─ layout.tsx           # Root layout, fonts, providers
│  │  ├─ providers.tsx        # NextAuth SessionProvider wrapper
│  │  ├─ globals.css          # Tailwind base + design tokens
│  │  ├─ login/page.tsx       # Google + email/password auth UI
│  │  ├─ feed/                # Community feed (page + client)
│  │  ├─ profile/             # Profile, XP, badges, premium upsell
│  │  ├─ share/[slug]/        # Public share page (OG metadata + CTA)
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/route.ts   # NextAuth handler
│  │     ├─ auth/signup/route.ts          # Email/password signup
│  │     ├─ simulate/route.ts             # Core: runs AI sim + image-gen
│  │     ├─ feed/route.ts                 # Paginated public feed
│  │     ├─ like/route.ts                 # Like/unlike toggle
│  │     ├─ save/route.ts                 # Save/unsave toggle
│  │     ├─ share/route.ts                # Fetch by share slug (JSON API)
│  │     └─ user/me/, user/upgrade/       # Profile data, premium upgrade
│  ├─ components/             # DivergenceMotif, BottomNav, ShareSheet, etc.
│  ├─ lib/
│  │  ├─ prisma.ts            # Prisma client singleton
│  │  ├─ auth.ts              # NextAuth config
│  │  ├─ simulation-engine.ts # Claude API call + schema validation + fallback
│  │  ├─ image-gen.ts         # OpenAI image gen → Vercel Blob upload
│  │  ├─ gamification.ts      # XP, levels, streaks, badge awarding
│  │  ├─ quota.ts             # Free-tier daily limit enforcement
│  │  └─ slug.ts              # Shareable URL slug generator
│  └─ types/                  # Shared TS types
├─ .env.example                # Every required env var, documented
├─ next.config.js
├─ tailwind.config.js
├─ vercel.json                 # Function timeout config for /api/simulate
└─ package.json
```

---

## 3. Local setup

### Prerequisites
- Node.js 18.18+ (Node 20 recommended)
- A Postgres database (local, or a free hosted one — see step 4 below)
- An Anthropic API key: https://console.anthropic.com
- (Optional for images) An OpenAI API key
- (Optional for Google sign-in) Google OAuth credentials

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in real values
cp .env.example .env.local

# 3. Push the Prisma schema to your database (creates all tables)
npx prisma db push

# 4. Seed badge definitions
npm run db:seed

# 5. Run the dev server
npm run dev
```

Visit `http://localhost:3000`.

---

## 4. Step-by-step: deploying to Vercel

### Step 1 — Create a Postgres database
Pick one (all have free tiers):
- **Vercel Postgres**: in your Vercel dashboard → Storage → Create Database → Postgres. It auto-injects `DATABASE_URL` and a pooled/direct URL pair into your project.
- **Neon** (https://neon.tech): create a project, copy the pooled connection string as `DATABASE_URL` and the direct one as `DIRECT_URL`.
- **Supabase** (https://supabase.com): Project Settings → Database → Connection string (use "Transaction" mode for `DATABASE_URL`, "Session" mode for `DIRECT_URL`).

### Step 2 — Push your code to GitHub
```bash
git init
git add .
git commit -m "Initial commit: What If? MVP"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

### Step 3 — Import the project into Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Framework preset: Vercel auto-detects **Next.js** — leave defaults
4. **Don't deploy yet** — add environment variables first (next step)

### Step 4 — Add environment variables
In Vercel → your project → **Settings → Environment Variables**, add every key from `.env.example`:

| Key | Where to get it |
|---|---|
| `DATABASE_URL` | Your Postgres provider (pooled connection string) |
| `DIRECT_URL` | Your Postgres provider (direct/non-pooled connection string) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` locally, paste the output |
| `NEXTAUTH_URL` | Your production URL, e.g. `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console → APIs & Services → Credentials → OAuth Client ID (Web application). Add `https://your-app.vercel.app/api/auth/callback/google` as an authorized redirect URI |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → API Keys |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys (optional — skip to disable image generation) |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Create → Blob — token is auto-injected once added to the project |
| `NEXT_PUBLIC_APP_URL` | Same as `NEXTAUTH_URL`, no trailing slash |

Set all of these for **Production**, **Preview**, and **Development** environments in the Vercel UI (or at minimum Production).

### Step 5 — Deploy
Click **Deploy** in Vercel. The `postinstall` script runs `prisma generate` automatically; the `build` script runs `prisma generate && next build`.

### Step 6 — Push the database schema
The schema isn't applied automatically on deploy — run this once from your local machine, pointed at the **production** database:
```bash
# Temporarily point your local .env.local DATABASE_URL/DIRECT_URL
# at production, or run with inline env vars:
DATABASE_URL="<prod-pooled-url>" DIRECT_URL="<prod-direct-url>" npx prisma db push
DATABASE_URL="<prod-pooled-url>" npm run db:seed
```

### Step 7 — Verify
- Visit your deployed URL
- Sign up with email/password, or sign in with Google
- Ask a question on the home screen — confirm a real Claude-generated result appears
- Check the feed, profile (XP/streak), and share flow

### Redeploying after changes
Every `git push` to `main` triggers an automatic Vercel deployment. If you change `prisma/schema.prisma`, run `npx prisma db push` against production again before/after deploying — Vercel does not run migrations for you.

---

## 5. Key implementation notes

- **Simulation engine** (`src/lib/simulation-engine.ts`): calls Claude with a
  strict system prompt and a `zod` schema. If the model's output doesn't
  validate (malformed JSON, missing field), it retries once, then falls
  back to a generic templated response rather than erroring out to the user.
- **Free tier** (`src/lib/quota.ts`): 3 simulations/day, reset by calendar
  day (UTC), enforced server-side before any AI call — so free users can't
  bypass it by hitting the API directly.
- **Image generation** is gated to premium users in `api/simulate/route.ts`
  to match the product's monetization split described in the spec. Free
  users still get the full text/chart result, just no AI image.
- **Gamification** (`src/lib/gamification.ts`): XP awarded per simulation,
  streaks computed by comparing `lastSimulationAt` to "today" in UTC, and
  badges awarded idempotently via a unique `(userId, badgeId)` constraint.
- **Sharing**: every simulation gets a random slug (`src/lib/slug.ts`) at
  creation time. The public `/share/[slug]` page is a **server component**
  so link previews (WhatsApp/Instagram/Twitter unfurling) get real Open
  Graph tags via `generateMetadata`.
- **Premium upgrade** (`src/app/api/user/upgrade/route.ts`) is intentionally
  a direct flag-flip with no payment processing, so the full product loop
  is testable without a Stripe account. See the comment in that file for
  the exact 3 steps to wire up real Stripe Checkout + webhooks.

---

## 6. What's stubbed / next steps for production hardening

- **Payments**: swap the direct upgrade for Stripe Checkout (see comment in `api/user/upgrade/route.ts`).
- **Rate limiting**: add a proper rate limiter (e.g. Upstash Redis) in front of `/api/simulate` to prevent abuse beyond the daily quota.
- **Comments**: the `Comment` model exists in the schema but doesn't yet have API routes/UI — straightforward to add following the `like`/`save` pattern.
- **Following**: the `Follow` model exists; the feed's "Following" tab queries it, but there's no follow/unfollow button in the UI yet.
- **Push notifications** for streak reminders and weekly challenges aren't implemented — would need a service worker + Web Push, or a third-party provider (OneSignal, etc.).
- **AI video** (mentioned as a premium feature in the spec) isn't implemented — there's no mature, affordable text-to-video API as of this writing suitable for per-request generation at consumer scale; revisit when one is available.
