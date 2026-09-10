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
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
        <h1 className="text-[15px] font-semibold uppercase tracking-[0.25em] text-neutral-200">
          naturalreps
        </h1>
      </header>

      <main className="flex-1 px-5 pb-28 pt-5">
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
