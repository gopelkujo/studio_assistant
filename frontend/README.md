# Studio Assistant - Frontend Architecture

The frontend for **Studio Assistant** is built using [Next.js v14](https://nextjs.org/) with the App Router (`src/app`). It serves as an internal tool UI for engaging with specialized game-studio AI agents.

## 🧠 Technical Overview for Developers

### 1. UI Components & Shadcn

The UI is built on [Shadcn UI](https://ui.shadcn.com/) and Radix UI primitives, not a monolithic component library.

- Standalone component atoms live in `src/components/ui/` (e.g., `button.tsx`, `textarea.tsx`).
- The Shadcn `Textarea` component has been stripped of its default border/ring/ring-offset so it renders as a clean transparent element inside custom-styled containers.
- `tailwind-merge` and `clsx` (via `src/lib/utils.ts`) extend standard Tailwind classes.

### 2. Key Components

| File                              | Responsibility                                                               |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `src/app/page.tsx`                | Root layout; manages mobile sidebar drawer state and `AboutModal` visibility |
| `src/components/chat-sidebar.tsx` | Session list, New Chat button, About link, GitHub/LinkedIn social links      |
| `src/components/chat-area.tsx`    | Full chat UI: messages, streaming, command pills, copy button, smart scroll  |
| `src/components/about-modal.tsx`  | Slide-in About panel with all 7 command docs and example prompts             |

### 3. State & Session Management (Zustand)

All sessions and model settings are persisted locally in `localStorage` using `zustand/middleware`. See `src/store/sessionStore.ts` and `src/store/modelSettingsStore.ts`.

Each `Message` in the store has:

- `content: string` — the full accumulated text (persisted in localStorage)
- `streamChunks?: string[]` — ephemeral array of raw SSE chunks used for animated rendering during active streaming; cleared by `finalizeMessage()` once the stream closes

The store exposes:

- `updateMessageContent(sessionId, messageId, chunk)` — appends to both `content` and `streamChunks`
- `finalizeMessage(sessionId, messageId)` — clears `streamChunks`, switching the message from animated to markdown rendering

### 4. SSE Client Hook (`useChatStream.ts`)

Browser-native `EventSource` doesn't support `POST` or custom headers, so we use `@microsoft/fetch-event-source`.

- Parses 7 slash commands (`/narrative`, `/asset-brief`, `/dialogue`, `/vibe-check`, `/bug-triager`, `/quest-logic`, `/summarize-email`) from the prompt before sending
- Pulls active generation settings (`temperature`, `maxTokens`) from the `modelSettingsStore`
- Extracts the `commandType` and `cleanPrompt`, then POSTs all data to `/ai/generate`
- Calls `updateMessageContent` on each chunk and `finalizeMessage` on stream close/error
- Exposes a `retryLastMessage` function to easily re-submit the last user prompt upon generation failure or manual retry

### 5. Streaming Text Animation

Messages have three render states based on `streamChunks`:

1. **Loading** (`content` empty + `isGenerating`) → 3 bouncing purple dots
2. **Streaming** (`streamChunks.length > 0`) → each chunk is a `motion.span` animating from `opacity:0 / y:3px / blur(3px)` → fully visible in 180ms
3. **Finished** (`streamChunks` cleared) → full `ReactMarkdown` render with `remark-gfm`

### 6. Smart Auto-Scroll

The chat scrolls intelligently rather than always snapping to the bottom:

- Tracks `isAtBottom` via a passive scroll listener on the Radix `[data-radix-scroll-area-viewport]` element
- **New message** → smooth scroll to bottom once
- **Streaming chunk + user at bottom** → instant scroll to follow
- **User scrolled up** → no forced scroll; user can read previous messages freely

### 7. Copy Button

Each completed message bubble shows a **Copy** button on hover:

- Appears with `opacity-0 group-hover/msg:opacity-100`
- Strips markdown syntax (`stripMarkdown()`) before writing to clipboard — pastes as clean plain text
- Switches to a green `✓ Copied!` state for 2 seconds, then resets

### 8. Markdown Rendering

AI outputs are rendered via `ReactMarkdown` + `remark-gfm`. Styles use the `@tailwindcss/typography` plugin (`.prose .prose-invert`) in `globals.css`.

---

## 💻 Developer Commands

```bash
# Install dependencies
npm install

# Run the local development server
npm run dev

# Lint project
npm run lint

# Build production bundle
npm run build
```
