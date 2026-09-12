"use client";

import { useCallback, useEffect, useState } from "react";
import { WorkoutEntry } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { useStorage } from "@/lib/useStorage";
import BottomNav, { Tab } from "@/components/BottomNav";
import HomeScreen from "@/components/HomeScreen";
import PostScreen from "@/components/PostScreen";
import ProfileScreen from "@/components/ProfileScreen";
import AuthScreen from "@/components/AuthScreen";

export default function Home() {
  const { user, loading } = useAuth();
  const storage = useStorage();
  const [tab, setTab] = useState<Tab>("home");
  const [history, setHistory] = useState<WorkoutEntry[]>([]);

  const refresh = useCallback(() => {
    storage.list().then(setHistory).catch(() => {});
  }, [storage]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
        <h1 className="text-[15px] font-semibold uppercase tracking-[0.25em] text-neutral-200">
          naturalreps
        </h1>
      </header>

      <main className="flex-1 px-5 pb-28 pt-5">
        {tab === "home" && (
          <HomeScreen history={history} onChanged={refresh} storage={storage} />
        )}
        {tab === "post" && (
          <PostScreen
            storage={storage}
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
