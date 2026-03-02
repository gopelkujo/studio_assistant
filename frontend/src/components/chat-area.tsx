"use client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useSessionStore } from "@/store/sessionStore";
import { useChatStream } from "@/hooks/useChatStream";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, Wand2, Box } from "lucide-react";

export function ChatArea() {
  const { activeSessionId, sessions } = useSessionStore();
  const { sendMessage, isGenerating, error } = useChatStream();
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = activeSessionId ? sessions[activeSessionId] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeSession?.messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    sendMessage(input);
    setInput("");
  };

  const insertCommand = (cmd: string) => {
    setInput(cmd + " ");
  };

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-zinc-400 h-full w-full">
        <Wand2 className="w-12 h-12 mb-4 text-primary/50" />
        <h2 className="text-xl font-medium mb-2 text-primary shadow-primary">
          Welcome to Studio Assistant
        </h2>
        <p>Select or create a new active session to begin writing commands.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative">
      {/* Header */}
      <div className="shrink-0 h-14 border-b border-zinc-800 flex items-center px-6">
        <h1 className="font-medium text-zinc-200">{activeSession.title}</h1>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6 bg-zinc-950/50">
        <div className="max-w-3xl mx-auto space-y-6 pb-6 pt-2">
          <AnimatePresence initial={false}>
            {activeSession.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <Avatar className="w-8 h-8 rounded shrink-0 bg-primary ring-1 ring-primary/50 shadow-[0_0_10px_rgba(255,0,255,0.4)]">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-[10px] rounded">
                      SA
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-xl px-4 py-3 max-w-[85%] ${msg.role === "user" ? "bg-zinc-800/80 text-zinc-100 border border-zinc-700/50" : "bg-card text-card-foreground border border-border prose prose-invert prose-p:leading-relaxed prose-headings:text-primary prose-a:text-primary"}`}
                >
                  {msg.role === "assistant" && !msg.content && isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
                {msg.role === "user" && (
                  <Avatar className="w-8 h-8 shrink-0 bg-zinc-800 ring-1 ring-zinc-700">
                    <AvatarFallback className="bg-zinc-800 text-zinc-300 font-medium text-xs">
                      U
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-md text-sm"
            >
              Error: {error}
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="shrink-0 p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-3xl mx-auto">
          {activeSession.messages.length === 0 && (
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                onClick={() => insertCommand("/narrative")}
                className="h-7 text-xs bg-zinc-900/50 border border-border text-zinc-300 hover:bg-zinc-800 hover:text-primary hover:border-primary/50 transition-colors"
              >
                <Wand2 className="w-3 h-3 mr-1" /> /narrative
              </Button>
              <Button
                type="button"
                onClick={() => insertCommand("/asset-brief")}
                className="h-7 text-xs bg-zinc-900/50 border border-border text-zinc-300 hover:bg-zinc-800 hover:text-primary hover:border-primary/50 transition-colors"
              >
                <Box className="w-3 h-3 mr-1" /> /asset-brief
              </Button>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 bg-zinc-900/80 border border-primary/20 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all p-2 shadow-inner"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your prompt here... Type / for specialized commands"
              className="resize-none border-0 bg-transparent focus-visible:ring-0 min-h-[44px] max-h-48 text-zinc-100 placeholder:text-zinc-500 py-3"
              disabled={isGenerating}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className={`h-10 w-10 shrink-0 rounded-lg p-0 flex items-center justify-center transition-colors ${input.trim() && !isGenerating ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(255,0,255,0.3)]" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-800"}`}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-zinc-600">
              AI outputs may not be accurate. Verify narrative lore before
              production.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
