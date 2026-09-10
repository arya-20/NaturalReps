// Canonical exercise catalog. The parser maps free text to `name` values here
// so the same movement is always stored under one consistent name.

export interface CatalogExercise {
  name: string;
  muscle: string;
  aliases: string[];
}

export const EXERCISE_CATALOG: CatalogExercise[] = [
  // ---- Back ----
  { name: "Lat Pulldown", muscle: "Back", aliases: ["lat pull down", "lat pull-down", "pulldown", "lat pulldowns"] },
  { name: "Wide-Grip Lat Pulldown", muscle: "Back", aliases: ["wide grip pulldown", "wide lat pulldown"] },
  { name: "Close-Grip Lat Pulldown", muscle: "Back", aliases: ["close grip pulldown"] },
  { name: "Pull-Up", muscle: "Back", aliases: ["pull up", "pullup", "pull-ups", "pullups", "chin up", "chin-up", "chinup"] },
  { name: "Seated Cable Row", muscle: "Back", aliases: ["cable row", "seated row", "seated rows"] },
  { name: "Bent-Over Barbell Row", muscle: "Back", aliases: ["barbell row", "bent over row", "bb row", "bent-over row"] },
  { name: "Pendlay Row", muscle: "Back", aliases: ["pendlay rows"] },
  { name: "Dumbbell Row", muscle: "Back", aliases: ["db row", "one arm row", "single arm row", "one-arm dumbbell row"] },
  { name: "T-Bar Row", muscle: "Back", aliases: ["tbar row", "t bar row"] },
  { name: "Chest-Supported Row", muscle: "Back", aliases: ["chest supported row", "machine row"] },
  { name: "Straight-Arm Pulldown", muscle: "Back", aliases: ["straight arm pulldown", "straight arm pushdown"] },
  { name: "Face Pull", muscle: "Back", aliases: ["face pulls", "facepull"] },
  { name: "Deadlift", muscle: "Back", aliases: ["conventional deadlift", "deadlifts", "dead lift"] },
  { name: "Romanian Deadlift", muscle: "Hamstrings", aliases: ["rdl", "rdls", "romanian dead lift"] },
  { name: "Sumo Deadlift", muscle: "Back", aliases: ["sumo dead lift"] },
  { name: "Rack Pull", muscle: "Back", aliases: ["rack pulls"] },
  { name: "Hyperextension", muscle: "Back", aliases: ["back extension", "hyperextensions", "back extensions"] },

  // ---- Chest ----
  { name: "Barbell Bench Press", muscle: "Chest", aliases: ["bench press", "bench", "flat bench", "bb bench", "flat barbell bench"] },
  { name: "Incline Barbell Bench Press", muscle: "Chest", aliases: ["incline bench", "incline bench press", "incline barbell bench"] },
  { name: "Decline Barbell Bench Press", muscle: "Chest", aliases: ["decline bench", "decline bench press"] },
  { name: "Dumbbell Bench Press", muscle: "Chest", aliases: ["db bench", "dumbbell press", "flat dumbbell press", "flat db press"] },
  { name: "Incline Dumbbell Press", muscle: "Chest", aliases: ["incline db press", "incline dumbbell bench"] },
  { name: "Dumbbell Fly", muscle: "Chest", aliases: ["db fly", "dumbbell flye", "flyes", "chest fly", "flies"] },
  { name: "Cable Fly", muscle: "Chest", aliases: ["cable flye", "cable crossover", "crossover", "cable flys"] },
  { name: "Pec Deck", muscle: "Chest", aliases: ["pec deck fly", "machine fly", "pec dec"] },
  { name: "Push-Up", muscle: "Chest", aliases: ["push up", "pushup", "push-ups", "pushups"] },
  { name: "Chest Dip", muscle: "Chest", aliases: ["dips", "chest dips", "dip"] },
  { name: "Machine Chest Press", muscle: "Chest", aliases: ["chest press", "machine press"] },

  // ---- Shoulders ----
  { name: "Overhead Press", muscle: "Shoulders", aliases: ["ohp", "military press", "shoulder press", "standing press", "barbell shoulder press"] },
  { name: "Seated Dumbbell Shoulder Press", muscle: "Shoulders", aliases: ["db shoulder press", "dumbbell shoulder press", "seated db press"] },
  { name: "Arnold Press", muscle: "Shoulders", aliases: ["arnold presses"] },
  { name: "Lateral Raise", muscle: "Shoulders", aliases: ["side raise", "lat raise", "lateral raises", "dumbbell lateral raise", "side lateral raise"] },
  { name: "Front Raise", muscle: "Shoulders", aliases: ["front raises"] },
  { name: "Rear Delt Fly", muscle: "Shoulders", aliases: ["reverse fly", "rear delt raise", "rear delt flye", "reverse flyes"] },
  { name: "Upright Row", muscle: "Shoulders", aliases: ["upright rows"] },
  { name: "Cable Lateral Raise", muscle: "Shoulders", aliases: ["cable side raise", "cable lat raise"] },
  { name: "Shrug", muscle: "Shoulders", aliases: ["shrugs", "barbell shrug", "dumbbell shrug"] },

  // ---- Biceps ----
  { name: "Barbell Curl", muscle: "Biceps", aliases: ["bb curl", "barbell curls", "bicep curl", "biceps curl"] },
  { name: "Dumbbell Curl", muscle: "Biceps", aliases: ["db curl", "dumbbell curls", "alternating curl"] },
  { name: "Hammer Curl", muscle: "Biceps", aliases: ["hammer curls"] },
  { name: "Preacher Curl", muscle: "Biceps", aliases: ["preacher curls", "ez bar preacher curl"] },
  { name: "Incline Dumbbell Curl", muscle: "Biceps", aliases: ["incline curl", "incline db curl"] },
  { name: "Cable Curl", muscle: "Biceps", aliases: ["cable curls"] },
  { name: "Concentration Curl", muscle: "Biceps", aliases: ["concentration curls"] },

  // ---- Triceps ----
  { name: "Tricep Pushdown", muscle: "Triceps", aliases: ["triceps pushdown", "cable pushdown", "rope pushdown", "pushdown", "tricep push down"] },
  { name: "Overhead Tricep Extension", muscle: "Triceps", aliases: ["overhead extension", "tricep extension", "french press", "overhead triceps extension"] },
  { name: "Skull Crusher", muscle: "Triceps", aliases: ["skullcrusher", "lying tricep extension", "skull crushers", "ez bar skull crusher"] },
  { name: "Close-Grip Bench Press", muscle: "Triceps", aliases: ["close grip bench", "cgbp"] },
  { name: "Tricep Dip", muscle: "Triceps", aliases: ["bench dip", "tricep dips", "triceps dip"] },
  { name: "Tricep Kickback", muscle: "Triceps", aliases: ["kickback", "kickbacks", "tricep kickbacks"] },

  // ---- Legs ----
  { name: "Back Squat", muscle: "Quads", aliases: ["squat", "squats", "barbell squat", "bb squat"] },
  { name: "Front Squat", muscle: "Quads", aliases: ["front squats"] },
  { name: "Hack Squat", muscle: "Quads", aliases: ["hack squats", "machine hack squat"] },
  { name: "Leg Press", muscle: "Quads", aliases: ["leg presses"] },
  { name: "Leg Extension", muscle: "Quads", aliases: ["leg extensions", "quad extension"] },
  { name: "Leg Curl", muscle: "Hamstrings", aliases: ["hamstring curl", "lying leg curl", "seated leg curl", "leg curls"] },
  { name: "Walking Lunge", muscle: "Quads", aliases: ["lunge", "lunges", "walking lunges", "dumbbell lunge"] },
  { name: "Bulgarian Split Squat", muscle: "Quads", aliases: ["split squat", "bulgarian split squats", "rear foot elevated split squat"] },
  { name: "Goblet Squat", muscle: "Quads", aliases: ["goblet squats"] },
  { name: "Calf Raise", muscle: "Calves", aliases: ["standing calf raise", "seated calf raise", "calf raises", "calves"] },
  { name: "Hip Thrust", muscle: "Glutes", aliases: ["hip thrusts", "barbell hip thrust"] },
  { name: "Glute Bridge", muscle: "Glutes", aliases: ["glute bridges"] },

  // ---- Core ----
  { name: "Plank", muscle: "Core", aliases: ["planks", "front plank"] },
  { name: "Hanging Leg Raise", muscle: "Core", aliases: ["leg raise", "hanging leg raises", "leg raises"] },
  { name: "Cable Crunch", muscle: "Core", aliases: ["cable crunches", "rope crunch"] },
  { name: "Crunch", muscle: "Core", aliases: ["crunches", "sit up", "sit-ups", "situps"] },
  { name: "Russian Twist", muscle: "Core", aliases: ["russian twists"] },
  { name: "Ab Wheel Rollout", muscle: "Core", aliases: ["ab wheel", "ab rollout", "rollouts"] },
];

// Flat list of canonical names for the model prompt.
export const CANONICAL_NAMES: string[] = EXERCISE_CATALOG.map((e) => e.name);

// Lookup helpers -----------------------------------------------------------

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const ALIAS_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const ex of EXERCISE_CATALOG) {
    map[norm(ex.name)] = ex.name;
    for (const alias of ex.aliases) map[norm(alias)] = ex.name;
  }
  return map;
})();

/**
 * Best-effort canonicalisation of an exercise name to a catalog entry.
 * Returns the canonical name if a confident match is found, else the
 * original (title-cased) input so novel exercises still work.
 */
export function canonicalise(input: string): string {
  const n = norm(input);
  if (ALIAS_MAP[n]) return ALIAS_MAP[n];

  // containment match (e.g. "incline dumbbell bench press" contains a known alias)
  for (const key of Object.keys(ALIAS_MAP)) {
    if (n === key) return ALIAS_MAP[key];
  }
  for (const key of Object.keys(ALIAS_MAP)) {
    if (n.includes(key) || key.includes(n)) return ALIAS_MAP[key];
  }

  // fallback: title case the raw input
  return input
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function muscleFor(name: string): string {
  const hit = EXERCISE_CATALOG.find((e) => e.name === name);
  return hit?.muscle ?? "Other";
}
