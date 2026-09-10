"use client";

import { WorkoutEntry } from "@/lib/types";
import { deleteWorkout } from "@/lib/storage";
import WorkoutView from "@/components/WorkoutView";

export default function HomeScreen({
  history,
  onChanged,
}: {
  history: WorkoutEntry[];
  onChanged: () => void;
}) {
  async function handleDelete(id: string) {
    await deleteWorkout(id);
    onChanged();
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Your workouts</h2>
      <p className="mb-4 text-sm text-neutral-400">
        {history.length} logged · stored on this device
      </p>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-8 text-center text-sm text-neutral-500">
          No workouts yet. Tap the + button to log your first one.
        </div>
      ) : (
        <ul className="space-y-4">
          {history.map((w) => (
            <li
              key={w.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur"
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
    </div>
  );
}
