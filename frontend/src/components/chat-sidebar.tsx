"use client";
import * as React from "react";
import { useSessionStore } from "@/store/sessionStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare, Trash2 } from "lucide-react";

export function ChatSidebar() {
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

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full text-zinc-100 p-3">
      <div className="flex items-center gap-2 px-2 pb-4 pt-2 border-b border-border/50 mb-2">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-[0_0_15px_rgba(255,0,255,0.4)]">
          SA
        </div>
        <span className="font-semibold tracking-tight">Studio Assistant</span>
      </div>

      <Button
        onClick={() => createSession()}
        className="w-full justify-start gap-2 mb-4 bg-zinc-900/50 border border-border/50 hover:bg-zinc-800 hover:text-primary transition-colors text-zinc-100"
      >
        <PlusCircle className="w-4 h-4" />
        New Chat
      </Button>

      <ScrollArea className="flex-1">
        <div className="space-y-1 pr-3">
          {sessionsList.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${activeSessionId === session.id ? "bg-primary/20 text-primary font-medium border border-primary/30" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent"}`}
              onClick={() => setActiveSession(session.id)}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{session.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
