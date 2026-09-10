"use client";

import { useEffect, useState } from "react";
import { ParsedWorkout, WorkoutEntry } from "@/lib/types";
import { saveWorkout, getWorkouts, deleteWorkout } from "@/lib/storage";

const EXAMPLE =
  "4 sets of lat pull down, first set was warm up with 50kg 10 reps, then 3 sets 60, 65 and 70kg, all 8 reps, last one to failure";

export default function Home() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<WorkoutEntry[]>([]);

  useEffect(() => {
    getWorkouts().then(setHistory).catch(() => {});
  }, []);

  async function handleParse() {
    setError("");
    setParsed(null);
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
    if (!parsed) return;
    const entry: WorkoutEntry = {
      ...parsed,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      raw_text: text,
    };
    await saveWorkout(entry);
    setHistory(await getWorkouts());
    setParsed(null);
    setText("");
  }

  async function handleDelete(id: string) {
    await deleteWorkout(id);
    setHistory(await getWorkouts());
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gym AI</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Log your workout in plain English. AI does the rest.
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={EXAMPLE}
          className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm outline-none focus:border-neutral-600"
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleParse}
            disabled={loading || !text.trim()}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            {loading ? "Parsing…" : "Parse workout"}
          </button>
          <button
            onClick={() => setText(EXAMPLE)}
            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-300"
          >
            Try example
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>

      {parsed && (
        <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-300">Preview</h2>
          <WorkoutView workout={parsed} />
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
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-neutral-500">No workouts logged yet.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((w) => (
              <li
                key={w.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    {new Date(w.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="text-xs text-neutral-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
                <WorkoutView workout={w} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function WorkoutView({ workout }: { workout: ParsedWorkout }) {
  return (
    <div className="space-y-4">
      {workout.exercises.map((ex, i) => (
        <div key={i}>
          <h3 className="mb-1 font-medium">{ex.exercise}</h3>
          <ul className="space-y-1">
            {ex.sets.map((s, j) => (
              <li key={j} className="flex items-center gap-2 text-sm text-neutral-300">
                <span className="w-6 text-neutral-500">{j + 1}.</span>
                <span>
                  {s.weight_kg ?? "—"}kg × {s.reps ?? "—"}
                </span>
                {s.warmup && (
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                    warm-up
                  </span>
                )}
                {s.to_failure && (
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                    to failure
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
