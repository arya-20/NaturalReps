# NaturalReps

**AI-powered workout logger.** Describe your training in plain English — _"4 sets of lat pulldown, first was a warm-up at 50kg for 10, then 60, 65 and 70kg for 8, last one to failure"_ — and NaturalReps turns it into clean, structured, editable training data. No more digging through endless exercise dropdowns.

🔗 **Live demo:** https://natural-reps.vercel.app

<!-- Replace with a real screenshot / GIF once captured -->
![NaturalReps screenshot](docs/screenshot.png)

---

## Features

- 🧠 **Natural-language logging** — free text is parsed into exercises, sets, reps, weight, warm-up and to-failure flags via OpenAI structured output.
- 🎤 **Voice input** — dictate your workout with the Web Speech API; it feeds the same parser.
- ✅ **Consistent exercise names** — a curated catalog (~70 common movements + aliases) plus server-side canonicalisation means the same lift is always stored under one name.
- ✏️ **Review & edit** — tweak any set before saving.
- 📊 **Progress charts** — total volume and estimated 1RM (Epley) over time, per exercise.
- ⚖️ **kg / lb toggle** — stored in kg, displayed in your preferred unit.
- 📱 **Installable PWA** — add to home screen, works offline; history stored locally in IndexedDB.
- 🎨 **Animated ASCII background** — a Canvas2D character-render effect (ripple animation, bloom, grain, vignette, glitch).
- 🔒 **Hardened API** — per-IP rate limiting, strict input validation, and security headers.

## Tech stack

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **OpenAI** (`gpt-4o-mini`, JSON-schema structured output) behind a serverless route
- **Recharts** for progress visualisation
- **IndexedDB** for offline-first local storage
- Deployed on **Vercel**

## Architecture

```
Browser (React PWA)
  │  free text / voice
  ▼
/api/parse  ──►  OpenAI (structured JSON)
  │  rate-limit · validate · canonicalise
  ▼
Structured workout ──► IndexedDB (local history) ──► charts & stats
```

The OpenAI API key lives only in a server-side environment variable and is never exposed to the client.

## Running locally

```bash
git clone https://github.com/arya-20/NaturalReps.git
cd NaturalReps
npm install
cp .env.example .env.local   # add your OPENAI_API_KEY
npm run dev                  # http://localhost:3000
```

You'll need an [OpenAI API key](https://platform.openai.com/api-keys) with a little credit (parsing costs a fraction of a cent per log).

## Security notes (PoC)

- **Rate limiting** is in-memory per serverless instance — fine to deter casual abuse in a demo. For production, back it with a shared store (e.g. Upstash Redis).
- Input is capped at 800 characters and validated before hitting the model.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS) are set globally.

## Roadmap

- Accounts + cloud sync (currently local-only)
- Native wrapper via Capacitor → App Store, with **Apple Health** integration
- Social feed for the **Post** tab
- Rest timer and routine builder

---

Built as a portfolio project. The ASCII background effect is a Canvas2D reimplementation inspired by the [21st.dev ASCII](https://21st.dev/community/ascii) recipe.
