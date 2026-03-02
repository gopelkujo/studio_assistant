import { useState } from "react";
import { useSessionStore } from "../store/sessionStore";
import { useModelSettings } from "../store/modelSettingsStore";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export function useChatStream() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { temperature, maxTokens } = useModelSettings();

  const activeSessionId = useSessionStore((state) => state.activeSessionId);
  const activeSession = useSessionStore((state) =>
    state.activeSessionId ? state.sessions[state.activeSessionId] : null,
  );
  const addMessage = useSessionStore((state) => state.addMessage);
  const updateMessageContent = useSessionStore(
    (state) => state.updateMessageContent,
  );
  const finalizeMessage = useSessionStore((state) => state.finalizeMessage);
  const setSessionTitle = useSessionStore((state) => state.setSessionTitle);

  const sendMessage = async (prompt: string) => {
    if (!activeSessionId) return;

    setError(null);
    setIsGenerating(true);

    // 1. Add User Message
    const userMessageId = Math.random().toString(36).substring(2, 9);
    addMessage(activeSessionId, {
      id: userMessageId,
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    });

    // 2. Determine Command Type
    let commandType = "narrative"; // Default
    let cleanPrompt = prompt;

    const COMMANDS = [
      "/narrative",
      "/asset-brief",
      "/dialogue",
      "/vibe-check",
      "/bug-triager",
      "/quest-logic",
      "/summarize-email",
    ];

    for (const cmd of COMMANDS) {
      if (prompt.startsWith(cmd)) {
        commandType = cmd.slice(1); // strip leading slash
        cleanPrompt = prompt.slice(cmd.length).trim();
        break;
      }
    }

    // 3. Update Title dynamically if it's the first message
    if (activeSession && activeSession.messages.length === 0) {
      const newTitle =
        cleanPrompt.length > 25
          ? `${cleanPrompt.substring(0, 25)}...`
          : cleanPrompt;
      setSessionTitle(activeSessionId, newTitle || "Untitled Chat");
    }

    // 4. Prepare AI Message Placeholder
    const assistantMessageId = Math.random().toString(36).substring(2, 9);
    addMessage(activeSessionId, {
      id: assistantMessageId,
      role: "assistant",
      content: "", // Will be streamed into
      timestamp: Date.now(),
    });

    // 5. Connect via SSE
    const isProduction = process.env.NODE_ENV === "production";
    const baseUrl = isProduction
      ? "https://studioassistant-production.up.railway.app"
      : "http://localhost:3001";

    try {
      await fetchEventSource(`${baseUrl}/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          prompt: cleanPrompt,
          type: commandType,
          temperature,
          maxTokens,
        }),
        onopen(res) {
          if (res.ok && res.status === 200) {
            return Promise.resolve();
          } else if (
            res.status >= 400 &&
            res.status < 500 &&
            res.status !== 429
          ) {
            throw new Error("Client request error.");
          } else {
            console.warn("SSE Error HTTP Status:", res.status);
            return Promise.resolve();
          }
        },
        onmessage(msg) {
          if (msg.event === "error") {
            let errorData;
            try {
              errorData = JSON.parse(msg.data);
            } catch {
              throw new Error(msg.data || "Stream error");
            }
            throw new Error(errorData.message || "Stream error");
          }

          if (!msg.data || msg.data === "[DONE]") {
            return;
          }

          try {
            const payload = JSON.parse(msg.data);
            if (payload.chunk) {
              updateMessageContent(
                activeSessionId,
                assistantMessageId,
                payload.chunk,
              );
            }
          } catch {
            console.error("Failed to parse SSE chunk:", msg.data);
          }
        },
        onclose() {
          finalizeMessage(activeSessionId, assistantMessageId);
          setIsGenerating(false);
        },
        onerror(err) {
          console.error("SSE connection error:", err);
          finalizeMessage(activeSessionId, assistantMessageId);
          setError(err.message || "Failed to connect to AI server");
          setIsGenerating(false);
          throw err; // Stop retrying on critical failure
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred during generation.");
      } else {
        setError("An error occurred during generation.");
      }
      setIsGenerating(false);
    }
  };

  const retryLastMessage = () => {
    if (!activeSession) return;

    // Find the last user message
    const lastUserMessage = [...activeSession.messages]
      .reverse()
      .find((msg) => msg.role === "user");
    if (lastUserMessage) {
      setError(null);
      // Optional UI polish: We could remove the failed assistant message from the store here,
      // but the simplest rock-solid approach is just re-sending the same text as a new prompt to kick off the flow again.
      // Easiest approach for now is appending a new generation attempt.
      sendMessage(lastUserMessage.content);
    }
  };

  return {
    sendMessage,
    retryLastMessage,
    isGenerating,
    error,
  };
}
