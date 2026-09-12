import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { WorkoutEntry } from "./types";

// Workouts stored at: users/{uid}/workouts/{id}
function col(uid: string) {
  return collection(db, "users", uid, "workouts");
}

export async function saveWorkoutRemote(
  uid: string,
  entry: WorkoutEntry
): Promise<void> {
  await setDoc(doc(db, "users", uid, "workouts", entry.id), entry);
}

export async function getWorkoutsRemote(uid: string): Promise<WorkoutEntry[]> {
  const q = query(col(uid), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WorkoutEntry);
}

export async function deleteWorkoutRemote(
  uid: string,
  id: string
): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "workouts", id));
}
