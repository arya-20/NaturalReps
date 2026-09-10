"use client";

import { useCallback, useEffect, useState } from "react";
import { WorkoutEntry } from "@/lib/types";
import { getWorkouts } from "@/lib/storage";
import BottomNav, { Tab } from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import PostScreen from "@/components/PostScreen";
import ProfileScreen from "@/components/ProfileScreen";

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [history, setHistory] = useState<WorkoutEntry[]>([]);

  const refresh = useCallback(() => {
    getWorkouts().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-2xl px-4 pt-8">
        <h1 className="text-xl font-bold tracking-tight">
          Natural<span className="text-[#3ca6ff]">Reps</span>
        </h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-28 pt-4">
        {tab === "home" && (
          <HomeScreen history={history} onChanged={refresh} />
        )}
        {tab === "post" && (
          <PostScreen
            onSaved={() => {
              refresh();
              setTab("home");
            }}
          />
        )}
        {tab === "profile" && <ProfileScreen history={history} />}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
