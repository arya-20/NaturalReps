export type Unit = "kg" | "lb";

const LB_PER_KG = 2.2046226218;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

/** Convert a kg value to the display unit, rounded to 1 dp. */
export function displayWeight(kg: number | null, unit: Unit): number | null {
  if (kg == null) return null;
  const v = unit === "kg" ? kg : kgToLb(kg);
  return Math.round(v * 10) / 10;
}

/** Estimated one-rep max (Epley formula), returned in kg. */
export function epley1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}
