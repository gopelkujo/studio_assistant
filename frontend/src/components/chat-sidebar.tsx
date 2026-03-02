"use client";
import * as React from "react";
import { useSessionStore } from "@/store/sessionStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusCircle,
  MessageSquare,
  Trash2,
  X,
  Info,
  Github,
  Linkedin,
} from "lucide-react";

interface ChatSidebarProps {
  onClose?: () => void;
  onOpenAbout?: () => void;
}

export function ChatSidebar({ onClose, onOpenAbout }: ChatSidebarProps) {
  const {
    sessions,
    activeSessionId,
    createSession,
    setActiveSession,
    deleteSession,
  } = useSessionStore();

  const sessionsList = Object.values(sessions).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  const handleNewChat = () => {
    createSession();
    onClose?.();
  };

  const handleSelectSession = (id: string) => {
    setActiveSession(id);
    onClose?.();
  };

  return (
    <div className="w-72 sm:w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-full text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/70">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs shadow-[0_0_18px_rgba(168,85,247,0.5)] shrink-0">
            SA
          </div>
          <div>
            <span className="font-semibold tracking-tight text-sm text-zinc-100">
              Studio Assistant
            </span>
            <p className="text-[10px] text-zinc-500 leading-none mt-0.5">
              AI for Game Devs
            </p>
          </div>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          onClick={onClose}
          className="md:hidden text-zinc-500 hover:text-zinc-200 transition-colors p-1 rounded"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pt-3 pb-2">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2.5 bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/60 text-primary transition-all duration-200 font-medium text-sm group"
        >
          <PlusCircle className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          New Chat
        </Button>
      </div>

      {/* Session Label */}
      {sessionsList.length > 0 && (
        <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest px-4 py-2">
          Recent Chats
        </p>
      )}

      {/* Session List */}
      <ScrollArea className="flex-1 px-2 pb-3">
        <div className="space-y-0.5">
          {sessionsList.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
              <p className="text-xs text-zinc-600 leading-relaxed">
                No sessions yet. Start a new chat to begin.
              </p>
            </div>
          ) : (
            sessionsList.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-150 ${
                  activeSessionId === session.id
                    ? "bg-primary/15 text-primary font-medium border border-primary/25 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.1)]"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 border border-transparent"
                }`}
                onClick={() => handleSelectSession(session.id)}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${activeSessionId === session.id ? "text-primary" : "text-zinc-600 group-hover:text-zinc-400"}`}
                  />
                  <span className="truncate text-xs leading-snug">
                    {session.title}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all duration-150 p-1 rounded shrink-0"
                  aria-label="Delete session"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-zinc-800/70 px-3 py-3 space-y-2">
        {/* About button */}
        <button
          onClick={onOpenAbout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all duration-150 text-xs"
        >
          <Info className="w-3.5 h-3.5 shrink-0" />
          About &amp; Commands
        </button>

        {/* Session-only notice */}
        <div className="flex items-start gap-1.5 px-1 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
          <svg
            className="w-3 h-3 text-amber-500/70 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <p className="text-[10px] text-zinc-600 leading-snug">
            Chats are saved for this tab only and will be cleared when you close
            it.
          </p>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] text-zinc-700">Powered by GPT-4o</p>
          <div className="flex items-center gap-1">
            <a
              href="https://github.com/gopelkujo/studio_assistant/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
              aria-label="GitHub repository"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.linkedin.com/in/gopel-kujo/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-zinc-600 hover:text-blue-400 hover:bg-zinc-800 transition-all"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
