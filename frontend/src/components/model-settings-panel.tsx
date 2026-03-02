"use client";
import * as React from "react";
import { useModelSettings } from "@/store/modelSettingsStore";
import { SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function ModelSettingsPanel() {
  const [open, setOpen] = React.useState(false);
  const { temperature, maxTokens, setTemperature, setMaxTokens, reset } =
    useModelSettings();

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Model settings"
        className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150 ${
          open
            ? "text-primary bg-primary/15 border-primary/40"
            : "text-zinc-500 hover:text-zinc-200 bg-transparent border-transparent hover:border-zinc-700"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="settings-panel"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full right-0 mb-2 w-72 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
              <span className="text-xs font-semibold text-zinc-300">
                Model Parameters
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={reset}
                  title="Reset to defaults"
                  className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="px-4 py-3 space-y-5">
              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium text-zinc-300">
                      Temperature
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      Creativity / randomness of output
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-zinc-700 accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
                  <span>0 — Precise</span>
                  <span>1 — Balanced</span>
                  <span>2 — Creative</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium text-zinc-300">
                      Max Tokens
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      Max length of AI response
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {maxTokens.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={256}
                  max={4096}
                  step={128}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 rounded-full appearance-none bg-zinc-700 accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
                  <span>256</span>
                  <span>2,048</span>
                  <span>4,096</span>
                </div>
              </div>

              {/* Quick presets */}
              <div>
                <p className="text-[10px] text-zinc-600 mb-1.5">
                  Quick presets
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { label: "Precise", temp: 0.2, tokens: 1000 },
                    { label: "Balanced", temp: 0.7, tokens: 1500 },
                    { label: "Creative", temp: 1.2, tokens: 2048 },
                    { label: "Max", temp: 1.5, tokens: 4096 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setTemperature(p.temp);
                        setMaxTokens(p.tokens);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-medium rounded-lg border transition-all duration-150 ${
                        temperature === p.temp && maxTokens === p.tokens
                          ? "text-primary bg-primary/15 border-primary/40"
                          : "text-zinc-500 bg-zinc-800 border-zinc-700/50 hover:text-zinc-200 hover:border-zinc-600"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
