"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { WorkoutEntry } from "@/lib/types";
import { displayWeight, epley1RM, Unit } from "@/lib/units";
import { useSettings } from "@/lib/settings";

interface Point {
  date: string;
  volume: number; // in display unit
  best1rm: number; // in display unit
}

function buildSeries(
  entries: WorkoutEntry[],
  exercise: string,
  unit: Unit
): Point[] {
  const byDay = new Map<string, { volumeKg: number; best1rmKg: number }>();
  for (const e of entries) {
    const day = e.created_at.slice(0, 10);
    for (const ex of e.exercises) {
      if (ex.exercise !== exercise) continue;
      for (const s of ex.sets) {
        if (s.weight_kg == null || s.reps == null || s.warmup) continue;
        const cur = byDay.get(day) ?? { volumeKg: 0, best1rmKg: 0 };
        cur.volumeKg += s.weight_kg * s.reps;
        cur.best1rmKg = Math.max(cur.best1rmKg, epley1RM(s.weight_kg, s.reps));
        byDay.set(day, cur);
      }
    }
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({
      date: date.slice(5), // MM-DD
      volume: displayWeight(v.volumeKg, unit) ?? 0,
      best1rm: displayWeight(v.best1rmKg, unit) ?? 0,
    }));
}

export default function ProgressCharts({ entries }: { entries: WorkoutEntry[] }) {
  const { unit } = useSettings();

  const exercises = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.exercises.forEach((ex) => set.add(ex.exercise)));
    return [...set].sort();
  }, [entries]);

  const [selected, setSelected] = useState<string>(exercises[0] ?? "");
  const active = selected || exercises[0] || "";
  const data = useMemo(
    () => (active ? buildSeries(entries, active, unit) : []),
    [entries, active, unit]
  );

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Log some workouts to see your progress charts.
      </p>
    );
  }

  return (
    <div>
      <select
        value={active}
        onChange={(e) => setSelected(e.target.value)}
        className="mb-4 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
      >
        {exercises.map((ex) => (
          <option key={ex} value={ex}>
            {ex}
          </option>
        ))}
      </select>

      {data.length < 1 ? (
        <p className="text-sm text-neutral-500">No working sets recorded yet.</p>
      ) : (
        <div className="space-y-8">
          <ChartCard title={`Total volume (${unit})`}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" fontSize={12} />
              <YAxis stroke="#737373" fontSize={12} width={40} />
              <Tooltip
                contentStyle={{
                  background: "#0a0a0a",
                  border: "1px solid #262626",
                  borderRadius: 8,
                }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#3ca6ff"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartCard>

          <ChartCard title={`Estimated 1RM (${unit})`}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" fontSize={12} />
              <YAxis stroke="#737373" fontSize={12} width={40} />
              <Tooltip
                contentStyle={{
                  background: "#0a0a0a",
                  border: "1px solid #262626",
                  borderRadius: 8,
                }}
              />
              <Line
                type="monotone"
                dataKey="best1rm"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-neutral-300">{title}</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
