# 1. Project Name

**Studio Assistant** — A full-stack, AI-powered internal productivity tool designed specifically for game development studios. It provides specialized, context-aware AI agents (like a Narrative Designer and an Art Director) to assist with daily studio drafting tasks via a real-time streaming chat interface.

# 2. Live Demo

- **Frontend (Vercel)**: [https://gamestudioassistant.vercel.app](https://gamestudioassistant.vercel.app)
- **Backend API (Railway)**: [https://studioassistant-production.up.railway.app](https://studioassistant-production.up.railway.app)

# 3. Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI, Zustand (Local Storage), Framer Motion
- **Backend**: NestJS, TypeScript, RxJS
- **AI Service**: OpenAI SDK (gpt-4o) using Server-Sent Events (SSE) streaming
- **Deployment Platform**: Vercel (Frontend), Railway (Backend)

# 4. Time Log

- 09:55 - 02/03/2026 **[Initialize project]**
- 16:37 - 02/03/2026 **[Project completed]**

# 5. AI Tools Used

- **Google Gemini (Antigravity Agent)**: Used as a pair-programming partner. Assisted in architecting the standalone folder structure, scaffolding the NestJS backend, building the Next.js frontend, styling the Cyberpunk UI with Tailwind CSS, implementing real-time SSE streaming, and diagnosing/resolving NPM dependency issues during Railway deployment.

# 6. Setup Instructions

To run the project locally, you will need to start both the frontend and backend development servers in separate terminals.

### Backend Setup

```bash
cd backend
npm install

# Set up your environment variables
cp .env.example .env
# Edit the .env file and add your OPENAI_API_KEY
```

To start the backend development server:

```bash
npm run start:dev
```

_The backend API and health check will be available at `http://localhost:3001`._

### Frontend Setup

Open a new terminal session.

```bash
cd frontend
npm install
```

To start the frontend UI:

```bash
npm run dev
```

_The frontend application will be available at `http://localhost:3000`._

# 7. Design Decisions

- **Standalone Architecture**: Separated the code into independent `/frontend` and `/backend` directories instead of a complex NPM Workspace monorepo to ensure a much simpler deployment process and cleaner separation of concerns.
- **Server-Sent Events (SSE)**: Implemented SSE in NestJS instead of WebSockets or REST. This allows the AI responses to stream token-by-token directly to the client, providing a fast, real-time typing effect without the heavy overhead of bidirectional websockets.
- **Client-Side State**: Selected Zustand for state management due to its minimal boilerplate. Chat sessions, history, and model generation settings (Temperature, Max Tokens) are persisted locally in the browser's `localStorage` to avoid requiring a complex database setup for MVP testing.
- **Custom Theming**: Designed a high-contrast Cyberpunk/Industrial color palette with neon accents and `framer-motion` micro-animations. This shifts the aesthetic away from generic SaaS tools and aligns it closely with the intended Game Studio target audience.

# 8. What I Would Improve

If I had more time, I would implement the following:

- **Database Architecture**: Replace the local `zustand` storage with a remote Postgres database (via Prisma) to allow users to securely sync their chat histories and custom agent configurations across devices.
- **RAG Integration**: Enhance the AI agents with Retrieval-Augmented Generation (RAG) so that the Narrative Designer and Art Director can query internal studio design documents (PDFs, Confluence pages) to generate perfectly canon-compliant, project-specific lore and assets.
- **Streaming Granularity**: Improve the UI error boundaries to gracefully handle partial streaming network interruptions, allowing the AI to smoothly resume a chopped stream rather than just generating a full error block.
