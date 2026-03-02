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
import {
  Send,
  Loader2,
  Wand2,
  Box,
  RefreshCcw,
  MessageSquare,
  Eye,
  Bug,
  Swords,
  Mail,
  Sparkles,
  Copy,
  Check,
  FileDown,
} from "lucide-react";
import { exportSessionToPDF } from "@/lib/exportToPDF";

const COMMANDS = [
  {
    cmd: "/narrative",
    icon: Wand2,
    label: "/narrative",
    desc: "Branching story",
  },
  {
    cmd: "/asset-brief",
    icon: Box,
    label: "/asset-brief",
    desc: "Art direction",
  },
  {
    cmd: "/dialogue",
    icon: MessageSquare,
    label: "/dialogue",
    desc: "Character lines",
  },
  { cmd: "/vibe-check", icon: Eye, label: "/vibe-check", desc: "Visual mood" },
  {
    cmd: "/bug-triager",
    icon: Bug,
    label: "/bug-triager",
    desc: "Jira ticket",
  },
  {
    cmd: "/quest-logic",
    icon: Swords,
    label: "/quest-logic",
    desc: "Quest flow",
  },
  {
    cmd: "/summarize-email",
    icon: Mail,
    label: "/summarize-email",
    desc: "Studio email",
  },
] as const;

// Strip markdown syntax to produce clean plain text for clipboard
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (match) =>
      match.replace(/```(?:\w+)?\n?/g, "").trim(),
    ) // fenced code blocks (keep content)
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1") // bold+italic
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1") // italic
    .replace(/___(.+?)___/g, "$1") // bold+italic underscore
    .replace(/__(.+?)__/g, "$1") // bold underscore
    .replace(/_(.+?)_/g, "$1") // italic underscore
    .replace(/~~(.+?)~~/g, "$1") // strikethrough
    .replace(/^>+\s?/gm, "") // blockquotes
    .replace(/^[-*+]\s+/gm, "• ") // unordered list bullets → •
    .replace(/^\d+\.\s+/gm, "") // ordered list numbers
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → link text only
    .replace(/^[-*_]{3,}$/gm, "──────") // horizontal rules → dash line
    .replace(/\n{3,}/g, "\n\n") // collapse excess blank lines
    .trim();
}

export function ChatArea() {
  const { activeSessionId, sessions } = useSessionStore();
  const { sendMessage, retryLastMessage, isGenerating, error } =
    useChatStream();
  const [input, setInput] = useState("");
  const [isMultiline, setIsMultiline] = useState(false);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [isExporting, setIsExporting] = useState(false);

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Track whether user is near the bottom (within 80px)
  const isAtBottomRef = useRef(true);
  // Track message count to detect new-message starts vs streaming updates
  const prevMsgCountRef = useRef(0);

  const activeSession = activeSessionId ? sessions[activeSessionId] : null;

  // Utility: get the Radix ScrollArea viewport element
  const getViewport = () =>
    scrollWrapperRef.current?.querySelector<HTMLDivElement>(
      "[data-radix-scroll-area-viewport]",
    ) ?? null;

  // Update isAtBottom on scroll
  useEffect(() => {
    const viewport = getViewport();
    if (!viewport) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 80;
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId]);

  // Smart auto-scroll
  useEffect(() => {
    const viewport = getViewport();
    if (!viewport || !activeSession) return;

    const msgCount = activeSession.messages.length;
    const isNewMessage = msgCount > prevMsgCountRef.current;
    prevMsgCountRef.current = msgCount;

    if (isNewMessage) {
      // New user/assistant message pair started — always scroll to bottom (smooth)
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      isAtBottomRef.current = true;
    } else if (isAtBottomRef.current) {
      // Streaming update and user is at the bottom — follow instantly (no jank)
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "instant" });
    }
    // If user scrolled up: do nothing — let them read freely
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.messages]);

  // Auto-resize textarea: grow up to 5 lines, then scroll
  // Also track if content exceeds 2 lines to align the send button
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; // reset before measuring
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const paddingY =
      parseFloat(getComputedStyle(el).paddingTop) +
      parseFloat(getComputedStyle(el).paddingBottom);
    const maxHeight = lineHeight * 5 + paddingY;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    // Switch send button alignment: center for ≤2 lines, bottom for >2
    const lineCount = Math.round((el.scrollHeight - paddingY) / lineHeight);
    setIsMultiline(lineCount > 2);
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    sendMessage(input);
    setInput("");
    textareaRef.current?.focus();
  };

  const insertCommand = (cmd: string) => {
    setInput(cmd + " ");
    textareaRef.current?.focus();
  };

  const handleCopy = (id: string, text: string) => {
    if (!text) return;
    const plain = stripMarkdown(text);
    navigator.clipboard.writeText(plain).then(() => {
      setCopiedMap((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    });
  };

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 h-full w-full px-6 py-12">
        {/* Welcome glow orb */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_60px_rgba(168,85,247,0.3)]">
            <Sparkles className="w-9 h-9 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary animate-pulse" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-zinc-100 text-center tracking-tight">
          Welcome to{" "}
          <span className="text-primary drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">
            Studio Assistant
          </span>
        </h2>
        <p className="text-zinc-500 text-sm sm:text-base text-center max-w-xs leading-relaxed mb-8">
          Your AI-powered co-pilot for game development. Create a new chat to
          start generating.
        </p>

        {/* Command previews in welcome state */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-w-lg w-full">
          {COMMANDS.map(({ cmd, icon: Icon, label, desc }) => (
            <div
              key={cmd}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2.5 flex flex-col gap-1 hover:border-primary/40 hover:bg-zinc-900 transition-colors cursor-default"
            >
              <Icon className="w-4 h-4 text-primary/70" />
              <span className="text-[11px] font-mono text-primary/80 leading-none">
                {label}
              </span>
              <span className="text-[10px] text-zinc-600 leading-none">
                {desc}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-zinc-700 mt-8">
          ← Select or create a chat to begin
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Chat header */}
      <div className="shrink-0 h-14 border-b border-zinc-800/80 flex items-center justify-between px-4 sm:px-6 bg-zinc-950/80 backdrop-blur-sm">
        <div className="min-w-0">
          <h1 className="font-semibold text-zinc-200 text-sm sm:text-base truncate">
            {activeSession.title}
          </h1>
          <p className="text-[10px] text-zinc-600 leading-none mt-0.5">
            {activeSession.messages.length} message
            {activeSession.messages.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Export PDF button */}
        {activeSession.messages.length > 0 && (
          <button
            onClick={async () => {
              setIsExporting(true);
              // small delay so state can re-render
              await new Promise((r) => setTimeout(r, 50));
              exportSessionToPDF(activeSession);
              setTimeout(() => setIsExporting(false), 1500);
            }}
            disabled={isExporting}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-all duration-200 ${
              isExporting
                ? "text-green-400 bg-green-400/10 border-green-400/25"
                : "text-zinc-400 hover:text-zinc-100 bg-zinc-800/60 border-zinc-700/50 hover:bg-zinc-700/60 hover:border-zinc-600"
            }`}
            aria-label="Export conversation as PDF"
          >
            {isExporting ? (
              <>
                <Check className="w-3.5 h-3.5" /> Exported!
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" /> Export PDF
              </>
            )}
          </button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollWrapperRef} className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-4">
            <AnimatePresence initial={false}>
              {activeSession.messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.32,
                    ease: [0.23, 1, 0.32, 1],
                    delay: index === activeSession.messages.length - 1 ? 0 : 0,
                  }}
                  className={`group/msg flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="w-8 h-8 rounded-lg shrink-0 mt-0.5">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-[10px] rounded-lg border border-primary/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                        SA
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[80%] text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700/50 rounded-tr-sm"
                        : "bg-zinc-900/80 text-zinc-200 border border-zinc-800/60 rounded-tl-sm prose prose-invert prose-sm prose-p:leading-relaxed prose-headings:text-primary prose-headings:font-semibold prose-a:text-primary prose-code:text-primary/80 prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded"
                    }`}
                  >
                    {msg.role === "assistant" &&
                    !msg.content &&
                    isGenerating ? (
                      /* Loading dots — shown before the first chunk arrives */
                      <div className="flex items-center gap-2 py-0.5">
                        <div className="flex gap-1">
                          <span
                            className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500">
                          Generating...
                        </span>
                      </div>
                    ) : msg.role === "assistant" && msg.streamChunks?.length ? (
                      /* Animated streaming — each chunk fades in as it arrives */
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.streamChunks.map((chunk, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 3, filter: "blur(3px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                          >
                            {chunk}
                          </motion.span>
                        ))}
                      </p>
                    ) : (
                      /* Finished / historical — full markdown render */
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}

                    {/* Copy button — hidden during streaming */}
                    {!msg.streamChunks?.length && msg.content && (
                      <div
                        className={`flex mt-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] transition-all duration-150 opacity-0 group-hover/msg:opacity-100 ${
                            copiedMap[msg.id]
                              ? "text-green-400 bg-green-400/10 border border-green-400/20"
                              : "text-zinc-600 hover:text-zinc-300 bg-zinc-800/60 border border-zinc-700/40 hover:border-zinc-600"
                          }`}
                          aria-label="Copy message"
                        >
                          {copiedMap[msg.id] ? (
                            <>
                              <Check className="w-2.5 h-2.5" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-lg">
                        U
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Error block */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-destructive bg-destructive/10 border border-destructive/25 p-4 rounded-2xl text-sm ml-11"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm">
                    Generation Interrupted
                  </span>
                  <span className="text-destructive/70 text-xs">
                    The AI was unable to complete this request. {error}
                  </span>
                </div>
                <Button
                  onClick={() => retryLastMessage()}
                  disabled={isGenerating}
                  className="bg-destructive text-white hover:bg-destructive/80 border-0 h-8 px-4 text-xs font-semibold shrink-0 transition-colors"
                >
                  <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
                  Retry
                </Button>
              </motion.div>
            )}

            <div ref={scrollAnchorRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm p-3 sm:p-4">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Command pills — always visible */}
          <div className="flex flex-wrap gap-1.5">
            {COMMANDS.map(({ cmd, icon: Icon, label }) => (
              <button
                key={cmd}
                type="button"
                onClick={() => insertCommand(cmd)}
                className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-mono bg-zinc-900 border border-zinc-700/60 text-zinc-400 rounded-full hover:bg-zinc-800 hover:text-primary hover:border-primary/40 transition-all duration-150 group"
              >
                <Icon className="w-3 h-3 group-hover:text-primary transition-colors" />
                {label}
              </button>
            ))}
          </div>

          {/* Textarea + send */}
          <form
            onSubmit={handleSubmit}
            className={`relative flex gap-2 bg-zinc-900 border border-zinc-700/60 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/60 focus-within:border-primary/50 transition-all duration-200 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${isMultiline ? "items-end" : "items-center"}`}
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type a prompt or click a command above… (Shift+Enter for newline)"
              className="resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:outline-none min-h-[40px] text-zinc-100 placeholder:text-zinc-600 text-sm py-0.5 leading-relaxed flex-1 transition-[height] duration-100"
              disabled={isGenerating}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className={`h-9 w-9 shrink-0 rounded-xl p-0 flex items-center justify-center transition-all duration-200 ${
                input.trim() && !isGenerating
                  ? "bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_16px_rgba(168,85,247,0.4)]"
                  : "bg-zinc-800 text-zinc-600"
              }`}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          <p className="text-center text-[10px] text-zinc-700">
            AI outputs may be inaccurate. Verify before production use.
          </p>
        </div>
      </div>
    </div>
  );
}
