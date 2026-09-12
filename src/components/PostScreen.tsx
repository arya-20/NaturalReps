"use client";

import { useCallback, useState } from "react";
import { ParsedWorkout, WorkoutEntry } from "@/lib/types";
import WorkoutView from "@/components/WorkoutView";
import { useVoiceInput } from "@/lib/useVoiceInput";

const EXAMPLE =
  "4 sets of lat pull down, first set was warm up with 50kg 10 reps, then 3 sets 60, 65 and 70kg, all 8 reps, last one to failure";

export default function PostScreen({
  onSaved,
  storage,
}: {
  onSaved: () => void;
  storage: { save: (e: WorkoutEntry) => Promise<void> };
}) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const onVoice = useCallback((t: string) => {
    setText((prev) => (prev ? prev + " " + t : t));
  }, []);
  const voice = useVoiceInput(onVoice);

  async function handleParse() {
    setError("");
    setParsed(null);
    setSaved(false);
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setParsed(data as ParsedWorkout);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!parsed || parsed.exercises.length === 0) return;
    setError("");
    const entry: WorkoutEntry = {
      ...parsed,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      raw_text: text,
    };
    try {
      await storage.save(entry);
      setParsed(null);
      setText("");
      setSaved(true);
      onSaved();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(
        code === "permission-denied"
          ? "Couldn't save: Firestore rules not published. Publish firestore.rules in the Firebase console."
          : `Couldn't save your workout${code ? ` (${code})` : ""}. Please try again.`
      );
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Log a workout</h2>
      <p className="mb-4 text-sm text-neutral-400">
        Type or speak it in plain English.
      </p>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={EXAMPLE}
          className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 text-sm outline-none focus:border-neutral-600"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={handleParse}
            disabled={loading || !text.trim()}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            {loading ? "Parsing…" : "Parse workout"}
          </button>
          {voice.supported && (
            <button
              onClick={voice.listening ? voice.stop : voice.start}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                voice.listening
                  ? "bg-red-500 text-white"
                  : "border border-neutral-700 text-neutral-200"
              }`}
            >
              {voice.listening ? "● Listening…" : "🎤 Speak"}
            </button>
          )}
          <button
            onClick={() => setText(EXAMPLE)}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-300"
          >
            Try example
          </button>
        </div>
        {voice.error && (
          <p className="mt-2 text-xs text-neutral-500">Voice: {voice.error}</p>
        )}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {saved && (
          <p className="mt-3 text-sm text-emerald-400">Workout saved ✓</p>
        )}
      </div>

      {parsed && (
        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur">
          <h3 className="mb-3 text-sm font-semibold text-neutral-300">
            Review &amp; edit
          </h3>
          <WorkoutView workout={parsed} editable onChange={setParsed} />
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black"
            >
              Save
            </button>
            <button
              onClick={() => setParsed(null)}
              className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-300"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
