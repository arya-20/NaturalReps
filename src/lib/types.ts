export interface WorkoutSet {
  weight_kg: number | null;
  reps: number | null;
  warmup: boolean;
  to_failure: boolean;
}

export interface Exercise {
  exercise: string;
  sets: WorkoutSet[];
}

export interface ParsedWorkout {
  exercises: Exercise[];
}

export interface WorkoutEntry extends ParsedWorkout {
  id: string;
  created_at: string; // ISO timestamp
  raw_text: string;
}
