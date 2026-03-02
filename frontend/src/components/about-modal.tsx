"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Wand2,
  Box,
  MessageSquare,
  Eye,
  Bug,
  Swords,
  Mail,
  Sparkles,
  Github,
  Linkedin,
  ChevronRight,
} from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMAND_DOCS = [
  {
    cmd: "/narrative",
    icon: Wand2,
    title: "Narrative Designer",
    desc: "Generate immersive branching dialogue, character lore, or quest descriptions with 3 distinct player choices and emotional consequences.",
    example:
      "/narrative A veteran soldier returns to his destroyed hometown and finds a cryptic message left by his missing daughter",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
  },
  {
    cmd: "/asset-brief",
    icon: Box,
    title: "Art Director Brief",
    desc: "Translate a concept into a precise technical asset brief for 3D modelers and concept artists — includes poly budget, texture res, and PBR material specs.",
    example:
      "/asset-brief A weathered sci-fi sniper rifle used by a desert mercenary faction with a glowing UV-reactive scope",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  {
    cmd: "/dialogue",
    icon: MessageSquare,
    title: "Dialogue Writer",
    desc: "Write exactly 3 dialogue variations for a character with stage directions and distinct emotional registers (confident, hesitant, aggressive, etc.).",
    example:
      "/dialogue [Character: Kira, a cynical rogue AI] [Scenario: She realizes the player has been lying about their mission]",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
  },
  {
    cmd: "/vibe-check",
    icon: Eye,
    title: "Visual Mood Brief",
    desc: "Convert a vague description into a concrete visual brief — lighting setup, color palette with HEX references, reference mood, and contrast notes.",
    example:
      "/vibe-check A neon-lit underground black market in a post-apocalyptic megacity, dangerous but alive like a midnight bazaar",
    color: "text-pink-400",
    bg: "bg-pink-400/10 border-pink-400/20",
  },
  {
    cmd: "/bug-triager",
    icon: Bug,
    title: "QA Bug Ticket",
    desc: "Turn messy raw bug descriptions into a professional Jira-style ticket with severity rating, reproduction steps, expected vs actual result, and a root cause hypothesis.",
    example:
      "/bug-triager items are duplicated in inventory after dying, some have negative quantities, equipping one crashes the game",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
  },
  {
    cmd: "/quest-logic",
    icon: Swords,
    title: "Quest Flow Designer",
    desc: "Outline a quest flow with a Happy Path, a Fail State with recovery conditions, and a Unique Reward that feels meaningful.",
    example:
      "/quest-logic Infiltrate a corrupted guild hall and expose the guildmaster without being detected — stealth preferred but combat is a valid fail state",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
  },
  {
    cmd: "/summarize-email",
    icon: Mail,
    title: "Studio Email",
    desc: "Draft a concise, professional email with a subject line, body, and bulleted action items for external partners or internal teams.",
    example:
      "/summarize-email [Recipient: External Sound Studio] [Topic: We need to delay the audio delivery milestone by 2 weeks due to scope changes]",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
  },
];

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-100 text-sm">
                    About Studio Assistant
                  </h2>
                  <p className="text-[10px] text-zinc-500">
                    AI co-pilot for game development
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-200 transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* What is this */}
              <section>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                  What is this?
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  <span className="text-primary font-semibold">
                    Studio Assistant
                  </span>{" "}
                  is an AI-powered co-pilot built specifically for game
                  development teams. It provides specialized AI personas — each
                  fine-tuned for a different studio discipline — so you can
                  generate professional-quality outputs without leaving your
                  workflow.
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed mt-2">
                  Each command activates a different expert persona: narrative
                  designer, art director, QA lead, systems designer, and more —
                  all powered by GPT-4o with structured output formatting.
                </p>
              </section>

              {/* How to use */}
              <section>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                  How to use
                </h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2 text-sm text-zinc-400">
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Click a command pill above the input, or type it manually
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Add your context after the command, then press Enter
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Use{" "}
                      <kbd className="bg-zinc-800 border border-zinc-700 rounded px-1 text-[10px]">
                        Shift+Enter
                      </kbd>{" "}
                      for a new line in your prompt
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Create multiple sessions to keep different tasks organized
                    </span>
                  </div>
                </div>
              </section>

              {/* Commands */}
              <section>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                  Available Commands
                </h3>
                <div className="space-y-3">
                  {COMMAND_DOCS.map(
                    ({ cmd, icon: Icon, title, desc, example, color, bg }) => (
                      <div key={cmd} className={`border rounded-xl p-4 ${bg}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-4 h-4 ${color} shrink-0`} />
                          <code
                            className={`text-xs font-mono font-bold ${color}`}
                          >
                            {cmd}
                          </code>
                          <span className="text-xs text-zinc-500">
                            — {title}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                          {desc}
                        </p>
                        <div className="bg-zinc-950/60 rounded-lg p-2.5">
                          <p className="text-[10px] text-zinc-600 mb-1 uppercase tracking-wider">
                            Example
                          </p>
                          <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                            {example}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>
            </div>

            {/* Footer with social links */}
            <div className="shrink-0 border-t border-zinc-800 px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-zinc-600">
                Built by Gopel Kujo · Powered by GPT-4o
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/gopelkujo/studio_assistant/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
                  aria-label="GitHub repository"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/gopel-kujo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 transition-all"
                  aria-label="LinkedIn profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
