"use client";

import { Exercise, ParsedWorkout, WorkoutSet } from "@/lib/types";
import { displayWeight, lbToKg, Unit } from "@/lib/units";
import { useSettings } from "@/lib/settings";

interface Props {
  workout: ParsedWorkout;
  editable?: boolean;
  onChange?: (w: ParsedWorkout) => void;
}

export default function WorkoutView({ workout, editable, onChange }: Props) {
  const { unit } = useSettings();

  function update(next: ParsedWorkout) {
    onChange?.(next);
  }

  function updateSet(exIdx: number, setIdx: number, patch: Partial<WorkoutSet>) {
    const exercises = workout.exercises.map((ex, i) =>
      i !== exIdx
        ? ex
        : {
            ...ex,
            sets: ex.sets.map((s, j) => (j !== setIdx ? s : { ...s, ...patch })),
          }
    );
    update({ exercises });
  }

  function removeSet(exIdx: number, setIdx: number) {
    const exercises = workout.exercises
      .map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) }
      )
      .filter((ex) => ex.sets.length > 0);
    update({ exercises });
  }

  function addSet(exIdx: number) {
    const ex = workout.exercises[exIdx];
    const last = ex.sets[ex.sets.length - 1];
    const newSet: WorkoutSet = last
      ? { ...last, warmup: false, to_failure: false }
      : { weight_kg: null, reps: null, warmup: false, to_failure: false };
    const exercises = workout.exercises.map((e, i) =>
      i !== exIdx ? e : { ...e, sets: [...e.sets, newSet] }
    );
    update({ exercises });
  }

  return (
    <div className="space-y-4">
      {workout.exercises.map((ex, i) => (
        <ExerciseBlock
          key={i}
          ex={ex}
          unit={unit}
          editable={!!editable}
          onSet={(setIdx, patch) => updateSet(i, setIdx, patch)}
          onRemoveSet={(setIdx) => removeSet(i, setIdx)}
          onAddSet={() => addSet(i)}
        />
      ))}
    </div>
  );
}

function ExerciseBlock({
  ex,
  unit,
  editable,
  onSet,
  onRemoveSet,
  onAddSet,
}: {
  ex: Exercise;
  unit: Unit;
  editable: boolean;
  onSet: (setIdx: number, patch: Partial<WorkoutSet>) => void;
  onRemoveSet: (setIdx: number) => void;
  onAddSet: () => void;
}) {
  return (
    <div>
      <h3 className="mb-1 font-medium">{ex.exercise}</h3>
      <ul className="space-y-1">
        {ex.sets.map((s, j) => (
          <li key={j} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="w-6 text-neutral-500">{j + 1}.</span>
            {editable ? (
              <>
                <input
                  type="number"
                  inputMode="decimal"
                  value={displayWeight(s.weight_kg, unit) ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? null : Number(e.target.value);
                    const kg = val == null ? null : unit === "kg" ? val : lbToKg(val);
                    onSet(j, { weight_kg: kg });
                  }}
                  className="w-20 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1"
                />
                <span className="text-neutral-500">{unit} ×</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={s.reps ?? ""}
                  onChange={(e) =>
                    onSet(j, {
                      reps: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="w-16 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1"
                />
                <button
                  onClick={() => onSet(j, { warmup: !s.warmup })}
                  className={`rounded px-2 py-0.5 text-xs ${
                    s.warmup
                      ? "bg-amber-500/30 text-amber-200"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  warm-up
                </button>
                <button
                  onClick={() => onSet(j, { to_failure: !s.to_failure })}
                  className={`rounded px-2 py-0.5 text-xs ${
                    s.to_failure
                      ? "bg-red-500/30 text-red-200"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  to failure
                </button>
                <button
                  onClick={() => onRemoveSet(j)}
                  className="ml-auto text-xs text-neutral-500 hover:text-red-400"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <span className="text-neutral-300">
                  {displayWeight(s.weight_kg, unit) ?? "—"}
                  {unit} × {s.reps ?? "—"}
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
              </>
            )}
          </li>
        ))}
      </ul>
      {editable && (
        <button
          onClick={onAddSet}
          className="mt-2 text-xs text-neutral-400 hover:text-white"
        >
          + add set
        </button>
      )}
    </div>
  );
}
