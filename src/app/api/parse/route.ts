import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { CANONICAL_NAMES, canonicalise } from "@/lib/exercises";
import { ParsedWorkout } from "@/lib/types";

export const runtime = "nodejs";

const MAX_INPUT_CHARS = 800;

// ---- Simple in-memory rate limiter (per-IP, fixed window) ----------------
// Note: in-memory state is per serverless instance. Fine for a PoC to stop
// casual abuse; for production use a shared store (e.g. Upstash Redis).
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // per IP per window
const hits = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }
  entry.count++;
  return { ok: true, retryAfter: 0 };
}

// Opportunistically drop stale entries to bound memory.
function sweep() {
  if (hits.size < 5000) return;
  const now = Date.now();
  for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

const SYSTEM_PROMPT = `You convert a user's free-text description of a gym workout into structured JSON.

Rules:
- Extract every exercise mentioned and expand set descriptions into individual sets.
- If the user gives one weight/reps for N sets, produce N identical sets unless different values are specified.
- warmup: true only when the user explicitly marks a set as a warm-up.
- to_failure: true only when the user says that set was taken to failure.
- All weights are in kilograms. If a weight or reps value is genuinely not stated, use null.
- Do not invent exercises, sets, weights, or reps that the user did not mention.

Exercise naming (important for consistency):
- Map each exercise to the SINGLE closest name from this canonical list, copied EXACTLY:
${CANONICAL_NAMES.join(", ")}
- Only if none is a reasonable match, use a clean, conventional title-cased name.`;

const jsonSchema = {
  name: "workout",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      exercises: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            exercise: { type: "string" },
            sets: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  weight_kg: { type: ["number", "null"] },
                  reps: { type: ["number", "null"] },
                  warmup: { type: "boolean" },
                  to_failure: { type: "boolean" },
                },
                required: ["weight_kg", "reps", "warmup", "to_failure"],
              },
            },
          },
          required: ["exercise", "sets"],
        },
      },
    },
    required: ["exercises"],
  },
} as const;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: "Server is missing OPENAI_API_KEY." }, 500);
  }

  sweep();
  const ip = clientIp(req);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  // Content-type + body validation
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Expected application/json." }, 415);
  }

  let text: string;
  try {
    const body = await req.json();
    if (typeof body?.text !== "string") {
      return json({ error: "Field 'text' must be a string." }, 400);
    }
    text = body.text.trim();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  if (!text) return json({ error: "No text provided." }, 400);
  if (text.length > MAX_INPUT_CHARS) {
    return json({ error: `Input too long (max ${MAX_INPUT_CHARS} characters).` }, 413);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_schema", json_schema: jsonSchema },
      temperature: 0,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return json({ error: "Empty model response." }, 502);

    const parsed = JSON.parse(content) as ParsedWorkout;

    // Server-side canonicalisation as a safety net over the model's mapping.
    parsed.exercises = (parsed.exercises ?? []).map((ex) => ({
      ...ex,
      exercise: canonicalise(ex.exercise),
    }));

    return json(parsed);
  } catch (err) {
    console.error("Parse error:", err);
    return json({ error: "Failed to parse workout." }, 502);
  }
}
