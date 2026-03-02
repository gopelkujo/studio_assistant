# Studio Assistant - Frontend Architecture

The frontend for **Studio Assistant** is built using [Next.js v14](https://nextjs.org/) exclusively utilizing the modern App Router (`src/app`). It serves as an internal tool UI for engaging with highly specialized game-studio AI agents.

## 🧠 Technical Overview for Developers

### 1. UI Components & "Shadcn"

We do not use an external monolithic component library. Instead, the UI is constructed using [Shadcn UI](https://ui.shadcn.com/) and Radix UI primitives.

- You can find standalone functional component atoms inside `src/components/ui/` (e.g., `button.tsx`, `textarea.tsx`).
- These use generic `tailwind-merge` and `clsx` via `src/lib/utils.ts` to seamlessly extend standard Tailwind classes.

### 2. State & Session Management (`Zustand`)

To prevent building an entire database for internal chat histories, all sessions are persisted locally on the developer's machine using `zustand/middleware` and localStorage.

- See `src/store/sessionStore.ts`.
- The store tracks an object map of `sessions` and handles complex logic like appending new streaming chunks to specific message IDs inside the active chat.

### 3. Server-Sent Events (SSE) Client Hook

Browser native `EventSource` does not support `POST` requests or custom headers easily, so we utilize `@microsoft/fetch-event-source` inside our custom hook:

- See `src/hooks/useChatStream.ts`.
- It initiates a POST request to the NestJS backend, intercepts raw text chunks (such as `{"chunk": " The"}`), parses them, and immediately dispatches an update to the Zustand state.
- **Tip**: This prevents unmounting and re-mounting bugs that typically plague naive `React.useEffect` stream implementations.

### 4. Markdown & Typography Engine

The AI model outputs text strictly in Markdown. To render this cleanly:

- We map outputs through `ReactMarkdown`.
- We utilize `remark-gfm` to intercept and safely render bulleted lists and tables.
- The CSS rules creating the bold headers, structured lists, and spacing are handled natively using the `@tailwindcss/typography` plugin injected into `src/app/globals.css` (specifically, mapping the `.prose` and `.prose-invert` classes onto the chat bubble).

---

## 💻 Developer Commands

```bash
# Install dependencies
npm install

# Run the local development server (Turbo enabled)
npm run dev

# Lint project
npm run lint

# Compile static Next.js production bundle
npm run build
```
