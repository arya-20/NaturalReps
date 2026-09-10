"use client";

import { WorkoutEntry } from "@/lib/types";
import { useSettings } from "@/lib/settings";
import ProgressCharts from "@/components/ProgressCharts";

export default function ProfileScreen({ history }: { history: WorkoutEntry[] }) {
  const { unit, setUnit } = useSettings();

  const totalWorkouts = history.length;
  const totalSets = history.reduce(
    (acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.length, 0),
    0
  );
  const uniqueExercises = new Set(
    history.flatMap((w) => w.exercises.map((e) => e.exercise))
  ).size;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 text-2xl">
          🏋️
        </div>
        <div>
          <h2 className="text-2xl font-bold">Athlete</h2>
          <p className="text-sm text-neutral-400">Local profile · no account yet</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Workouts" value={totalWorkouts} />
        <Stat label="Sets" value={totalSets} />
        <Stat label="Exercises" value={uniqueExercises} />
      </div>

      <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur">
        <h3 className="mb-3 text-sm font-semibold text-neutral-300">Units</h3>
        <div className="inline-flex rounded-xl border border-neutral-700 p-1">
          {(["kg", "lb"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                unit === u ? "bg-white text-black" : "text-neutral-400"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur">
        <h3 className="mb-4 text-sm font-semibold text-neutral-300">Progress</h3>
        <ProgressCharts entries={history} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-center backdrop-blur">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}
