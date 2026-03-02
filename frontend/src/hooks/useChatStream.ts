import { useState } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { fetchEventSource } from '@microsoft/fetch-event-source';

export function useChatStream() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSessionId = useSessionStore((state) => state.activeSessionId);
  const addMessage = useSessionStore((state) => state.addMessage);
  const updateMessageContent = useSessionStore((state) => state.updateMessageContent);

  const sendMessage = async (prompt: string) => {
    if (!activeSessionId) return;

    setError(null);
    setIsGenerating(true);

    // 1. Add User Message
    const userMessageId = Math.random().toString(36).substring(2, 9);
    addMessage(activeSessionId, {
      id: userMessageId,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    });

    // 2. Determine Command Type (Naive Parser)
    let commandType: 'narrative' | 'asset-brief' = 'narrative';
    let cleanPrompt = prompt;

    if (prompt.startsWith('/narrative')) {
      commandType = 'narrative';
      cleanPrompt = prompt.replace('/narrative', '').trim();
    } else if (prompt.startsWith('/asset-brief')) {
      commandType = 'asset-brief';
      cleanPrompt = prompt.replace('/asset-brief', '').trim();
    }

    // 3. Prepare AI Message Placeholder
    const assistantMessageId = Math.random().toString(36).substring(2, 9);
    addMessage(activeSessionId, {
      id: assistantMessageId,
      role: 'assistant',
      content: '', // Will be streamed into
      timestamp: Date.now(),
    });

    // 4. Connect via SSE
    try {
      await fetchEventSource('http://localhost:3001/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          prompt: cleanPrompt,
          type: commandType,
        }),
        onopen(res) {
          if (res.ok && res.status === 200) {
            return Promise.resolve();
          } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
            throw new Error('Client request error.');
          } else {
            console.warn('SSE Error HTTP Status:', res.status);
            return Promise.resolve();
          }
        },
        onmessage(msg) {
          if (msg.event === 'error') {
            const errorData = JSON.parse(msg.data);
            throw new Error(errorData.message || 'Stream error');
          }
          
          try {
            const payload = JSON.parse(msg.data);
            if (payload.chunk) {
              updateMessageContent(activeSessionId, assistantMessageId, payload.chunk);
            }
          } catch {
            console.error('Failed to parse SSE chunk:', msg.data);
          }
        },
        onclose() {
          setIsGenerating(false);
        },
        onerror(err) {
          console.error('SSE connection error:', err);
          setError(err.message || 'Failed to connect to AI server');
          setIsGenerating(false);
          throw err; // Stop retrying on critical failure
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred during generation.');
      } else {
        setError('An error occurred during generation.');
      }
      setIsGenerating(false);
    }
  };

  return {
    sendMessage,
    isGenerating,
    error,
  };
}
