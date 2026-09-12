# NaturalReps — Project Context & Next Steps

_A working brief for the app. Not committed secrets — keep real keys out of this file._

## One-line description (for non-technical readers)
**NaturalReps is a phone app where you describe your gym workout in plain English (or by speaking) and AI instantly turns it into a clean, organised log — built with TypeScript and Next.js, powered by OpenAI, and hosted on Vercel.**

## Where everything lives (quick reference for next session)
| Thing | Location |
|---|---|
| Live app (hosting) | **Vercel** → https://natural-reps.vercel.app |
| Source code (git) | **GitHub** → https://github.com/arya-20/NaturalReps |
| Local project folder | `~/Library/CloudStorage/OneDrive-BTPlc/Desktop/portfolio/gym-ai` |
| Background source image (in app) | `portfolio/gym-ai/public/statue.png` |
| Background source image (spare copy) | `portfolio/gym-ai/images.png` (kept for reference) |
| Original image on Desktop | moved to `Desktop/portfolio/images.png` |
| OpenAI API key (server) | **Vercel** → Project → Settings → Environment Variables → `OPENAI_API_KEY` |
| OpenAI API key (local dev) | `portfolio/gym-ai/.env.local` (git-ignored; copy from `.env.example`) |
| Auth + database | **Firebase** → console.firebase.google.com (project `naturalreps`) |
| Firebase config (local dev) | `.env.local` → `NEXT_PUBLIC_FIREBASE_*` |
| Firebase config (production) | Vercel → Environment Variables → `NEXT_PUBLIC_FIREBASE_*` |
| Deploy trigger | any `git push` to `main` → Vercel auto-deploys |
| Headless screenshot tool (for visual checks) | Microsoft Edge at `/Applications/Microsoft Edge.app` (Chromium; use `--headless=new --screenshot=`) |

## What it is
An AI-powered gym workout logger. Users describe a workout in plain English (or by
voice); an LLM parses it into structured, editable training data. Built as a PWA so
it installs to the home screen and can later be wrapped for the App Store.

- **Live:** https://natural-reps.vercel.app
- **Repo:** https://github.com/arya-20/NaturalReps
- **Local path:** `portfolio/gym-ai`

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- OpenAI `gpt-4o-mini` (JSON-schema structured output) via the `/api/parse` serverless route
- Recharts (progress charts), IndexedDB (offline local history)
- Firebase Auth (Google + email/password) + Cloud Firestore (per-user storage)
- Inter (UI font) + JetBrains Mono (ASCII background)
- Deployed on Vercel (auto-deploys on push to `main`)

## Project map
```
src/
  app/
    layout.tsx        # fonts, SettingsProvider, ASCII background, iPhone frame
    page.tsx          # tab state (home/post/profile)
    globals.css       # base theme (Inter, dark)
    api/parse/route.ts# OpenAI parse: rate limit, validation, canonicalise
  components/
    AsciiBackground.tsx  # Canvas2D ASCII effect sampling public/statue.png
    BottomNav.tsx        # Home / Post / Profile
    HomeScreen.tsx       # workout history
    PostScreen.tsx       # text/voice input -> parse -> edit -> save
    ProfileScreen.tsx    # units toggle, stats, charts
    ProgressCharts.tsx   # volume + estimated 1RM over time
    WorkoutView.tsx      # unit-aware, editable set list
  lib/
    exercises.ts    # canonical exercise catalog + aliases + canonicalise()
    storage.ts      # IndexedDB CRUD
    settings.tsx    # unit preference context (localStorage)
    units.ts        # kg/lb + Epley 1RM
    useVoiceInput.ts# Web Speech API hook
    types.ts        # shared types
public/
  statue.png        # ASCII background source image
```

## Data model
```ts
WorkoutEntry {
  id, created_at, raw_text,
  exercises: [{ exercise, sets: [{ weight_kg, reps, warmup, to_failure }] }]
}
```
Weights always stored in **kg**; display converts to the chosen unit.

## OpenAI token setup

### Buying tokens (credit)
1. Go to https://platform.openai.com and sign in.
2. Open **Settings → Billing** (https://platform.openai.com/account/billing).
3. Click **Add payment method** and enter a card.
4. Click **Add to credit balance** (or **Buy credits**) — a small amount like **$5–$10** lasts a very long time for this app.
5. (Optional) Set a **monthly usage limit** under Billing → Limits so you never overspend.
6. Credit is prepaid; when it runs out, parsing stops until you top up. `gpt-4o-mini` costs ~a fraction of a cent per workout log.

### API key
1. Create a key at https://platform.openai.com/api-keys → **Create new secret key** → copy it (shown once).
2. **Local dev:** `cp .env.example .env.local` then set `OPENAI_API_KEY=sk-...` (`.env*` is git-ignored).
3. **Vercel:** Project → Settings → Environment Variables → `OPENAI_API_KEY` (already configured for the live deploy). Redeploy after changing.

## Security posture (current PoC)
- Per-IP rate limit (10 req/min) — **in-memory per serverless instance** (not global).
- Input validation: JSON content-type, string check, 800-char cap.
- Global security headers (nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, HSTS).
- OpenAI key server-side only.

---

## Next steps

### 1. Harden rate limiting (recommended before sharing widely)
Swap the in-memory limiter for a shared store so limits hold across serverless instances.
- Use **Upstash Redis** (free tier) + `@upstash/ratelimit`.
- Env vars: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

### 2. Auth (Firebase) — DONE ✅
Google + email/password login, per-user Firestore storage, sign-out. IndexedDB used as fallback when signed out.
- Code: `lib/firebase.ts` (init), `lib/auth.tsx` (AuthProvider), `lib/firestore.ts` (per-user CRUD), `lib/useStorage.ts` (Firestore when signed in, else IndexedDB), `components/AuthScreen.tsx` (login/signup).
- Data model in Firestore: `users/{uid}/workouts/{id}`.
- Security rules: `firestore.rules` (users can only read/write their own docs).
- Env vars (public config): `NEXT_PUBLIC_FIREBASE_*` in `.env.local` and Vercel.
- **Firebase console setup that was required (record for reference):**
  1. Authentication → Sign-in method → enable **Email/Password** and **Google** (set support email).
  2. Firestore Database → create (europe-west2) → publish rules from `firestore.rules`.
  3. Authentication → Settings → **Authorized domains** → add `natural-reps.vercel.app` (localhost already there). *This was the fix for Google sign-in failing.*
- Google sign-in uses popup, falls back to redirect if the popup is blocked.
- Firebase console: https://console.firebase.google.com (project `naturalreps`).

### 3. Product polish
- Screenshot/GIF into `docs/screenshot.png` for the README.
- Rest timer + routine builder.
- Social feed for the Post tab (needs auth first).
- Edit an already-saved workout (currently edit is pre-save only).

### 4. Native / Apple Health (future)
- Wrap with **Capacitor** to ship iOS/Android from the same codebase.
- Apple Health (HealthKit) read/write via a Capacitor plugin — requires the native wrapper + App Store enrolment ($99/yr).

## Known caveats
- ASCII background: no automated screenshot was taken (no headless browser locally); verified via serving + build. Tunables in `AsciiBackground.tsx`: `CELL` (density), `CONTRAST`, `ANIM_INTENSITY`, `TINT`.
- Source image has a faint watermark bottom-right (vignette dims it).
- Voice input support varies by browser; it hides itself if unsupported.
