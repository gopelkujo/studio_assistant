import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streamChunks?: string[]; // populated during streaming, cleared on done
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface SessionState {
  sessions: Record<string, Session>;
  activeSessionId: string | null;
  createSession: (title?: string) => string;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessageContent: (
    sessionId: string,
    messageId: string,
    chunk: string,
  ) => void;
  finalizeMessage: (sessionId: string, messageId: string) => void;
  setSessionTitle: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: {},
      activeSessionId: null,

      createSession: (title = "New Assistant Session") => {
        const id = generateId();
        const newSession: Session = {
          id,
          title,
          messages: [],
          updatedAt: Date.now(),
        };

        set((state) => ({
          sessions: { ...state.sessions, [id]: newSession },
          activeSessionId: id,
        }));

        return id;
      },

      setActiveSession: (id) =>
        set(() => ({
          activeSessionId: id,
        })),

      addMessage: (sessionId, message) =>
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: [...session.messages, message],
                updatedAt: Date.now(),
              },
            },
          };
        }),

      updateMessageContent: (sessionId, messageId, chunk) =>
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          const updatedMessages = session.messages.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                content: msg.content + chunk,
                streamChunks: [...(msg.streamChunks ?? []), chunk],
              };
            }
            return msg;
          });

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: updatedMessages,
                updatedAt: Date.now(),
              },
            },
          };
        }),

      // Call when streaming is done: clears chunks so render falls back to ReactMarkdown
      finalizeMessage: (sessionId, messageId) =>
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          const updatedMessages = session.messages.map((msg) => {
            if (msg.id === messageId) {
              return { ...msg, streamChunks: undefined };
            }
            return msg;
          });

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: { ...session, messages: updatedMessages },
            },
          };
        }),

      setSessionTitle: (id, title) =>
        set((state) => {
          const session = state.sessions[id];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [id]: {
                ...session,
                title,
                updatedAt: Date.now(),
              },
            },
          };
        }),

      deleteSession: (id) =>
        set((state) => {
          const newSessions = { ...state.sessions };
          delete newSessions[id];
          return {
            sessions: newSessions,
            activeSessionId:
              state.activeSessionId === id ? null : state.activeSessionId,
          };
        }),
    }),
    {
      name: "studio-assistant-sessions",
      storage: {
        getItem: (key) => {
          const item = sessionStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        },
        setItem: (key, value) => {
          sessionStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => sessionStorage.removeItem(key),
      },
    },
  ),
);
