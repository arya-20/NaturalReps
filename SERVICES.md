# NaturalReps — Master Services & Locations

Everything this app uses and where to find it.

## Services / accounts
| Service | Purpose | Where / URL | Login / owner |
|---|---|---|---|
| **GitHub** | Source code repo | https://github.com/arya-20/NaturalReps | arya-20 |
| **Vercel** | Hosting + serverless API + deploys | https://natural-reps.vercel.app (dashboard: vercel.com) | GitHub sign-in |
| **OpenAI** | Natural-language parsing (`gpt-4o-mini`) | https://platform.openai.com | personal account + billing |
| **Firebase** | Auth (Google + email/pw) + Firestore database | https://console.firebase.google.com — project `naturalreps` | Google account (aryagurjar20@gmail.com) |

## Keys / config
| Secret | Stored where |
|---|---|
| `OPENAI_API_KEY` (production) | Vercel → Project → Settings → Environment Variables |
| `OPENAI_API_KEY` (local dev) | `portfolio/gym-ai/.env.local` (git-ignored) |
| Firebase web config (to come) | `.env.local` + Vercel env vars (public config; secured by Firestore rules) |

## Code / files
| Item | Location |
|---|---|
| Local project folder | `~/Library/CloudStorage/OneDrive-BTPlc/Desktop/portfolio/gym-ai` |
| Background image (app) | `portfolio/gym-ai/public/statue.png` |
| Context doc | `portfolio/gym-ai/PROJECT_CONTEXT.md` |
| This file | `portfolio/gym-ai/SERVICES.md` |

## Workflow
- Edit code locally → `git push` to `main` → **Vercel auto-deploys**.
- Local dev: `npm run dev` in `portfolio/gym-ai` → http://localhost:3000
- Visual check: headless Microsoft Edge (`/Applications/Microsoft Edge.app`).

## Tech stack (plain)
TypeScript · Next.js (App Router) · Tailwind CSS · OpenAI · Recharts · IndexedDB · (soon) Firebase Auth + Firestore · hosted on Vercel · code on GitHub.
