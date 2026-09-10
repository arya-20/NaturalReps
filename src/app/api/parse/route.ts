import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You convert a user's free-text description of a gym workout into structured JSON.

Rules:
- Extract every exercise mentioned. Normalise exercise names to clean title case (e.g. "lat pull down" -> "Lat Pulldown").
- Expand set descriptions into individual sets. If the user gives one weight/reps for N sets, produce N identical sets unless they specify different values.
- warmup: true only when the user explicitly marks a set as a warm-up.
- to_failure: true only when the user says that set was taken to failure.
- Weights are in kilograms. If a weight or reps value is genuinely not stated, use null.
- Do not invent exercises, sets, weights, or reps that the user did not mention.`;

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

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  let text: string;
  try {
    const body = await req.json();
    text = (body?.text ?? "").toString().trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "No text provided." }, { status: 400 });
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
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Empty model response." }, { status: 502 });
    }
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    console.error("Parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse workout." },
      { status: 502 }
    );
  }
}
