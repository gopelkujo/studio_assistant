"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ModelSettings {
  temperature: number; // 0.0 – 2.0
  maxTokens: number; // 256 – 4096
  setTemperature: (v: number) => void;
  setMaxTokens: (v: number) => void;
  reset: () => void;
}

const DEFAULTS = {
  temperature: 0.7,
  maxTokens: 1500,
};

export const useModelSettings = create<ModelSettings>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTemperature: (v) => set({ temperature: v }),
      setMaxTokens: (v) => set({ maxTokens: v }),
      reset: () => set(DEFAULTS),
    }),
    { name: "studio-model-settings" },
  ),
);
