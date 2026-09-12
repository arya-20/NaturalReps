"use client";

import { useCallback } from "react";
import { useAuth } from "./auth";
import { WorkoutEntry } from "./types";
import { saveWorkout, getWorkouts, deleteWorkout } from "./storage";
import {
  saveWorkoutRemote,
  getWorkoutsRemote,
  deleteWorkoutRemote,
} from "./firestore";

/**
 * Unified workout storage. When a user is signed in, reads/writes go to
 * Firestore (per-user). When signed out, they use local IndexedDB so the
 * app still works offline / without an account.
 */
export function useStorage() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const save = useCallback(
    async (entry: WorkoutEntry) => {
      if (uid) await saveWorkoutRemote(uid, entry);
      else await saveWorkout(entry);
    },
    [uid]
  );

  const list = useCallback(async (): Promise<WorkoutEntry[]> => {
    if (uid) return getWorkoutsRemote(uid);
    return getWorkouts();
  }, [uid]);

  const remove = useCallback(
    async (id: string) => {
      if (uid) await deleteWorkoutRemote(uid, id);
      else await deleteWorkout(id);
    },
    [uid]
  );

  return { save, list, remove, signedIn: !!uid };
}
