"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Unit } from "./units";

interface Settings {
  unit: Unit;
  setUnit: (u: Unit) => void;
}

const SettingsContext = createContext<Settings | null>(null);
const KEY = "naturalreps-unit";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<Unit>("kg");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "kg" || saved === "lb") setUnitState(saved);
  }, []);

  function setUnit(u: Unit) {
    setUnitState(u);
    localStorage.setItem(KEY, u);
  }

  return (
    <SettingsContext.Provider value={{ unit, setUnit }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
