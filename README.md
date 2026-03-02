# Studio Assistant

**Studio Assistant** is an AI-powered internal productivity tool designed specifically for game development studios. It features a standalone frontend and backend architecture aimed at providing specialized, context-aware AI agents to assist with daily studio tasks.

![Studio Assistant Architecture](https://img.shields.io/badge/Architecture-Standalone-blue)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![Backend](https://img.shields.io/badge/Backend-NestJS-E0234E)

---

## 🏗️ Project Architecture

The repository is structured into two completely independent standalone applications to ensure a simple developer experience and clean separation of concerns:

- **`/frontend`**: A Next.js (App Router) React application.
  - **Styling**: Tailwind CSS & Shadcn UI for a premium, dark-mode aesthetic.
  - **State Management**: Zustand for persisting local chat sessions.
  - **Features**: A custom `useChatStream` hook to digest and render Server-Sent Events (SSE) in real-time using `react-markdown`.
- **`/backend`**: A NestJS API server.
  - **AI Integration**: Connects to the OpenAI SDK.
  - **Streaming**: Exposes Server-Sent Events (`@Sse()`) to stream AI responses token-by-token back to the client.
  - **Specialized Roles**: Contains the domain logic and highly engineered system prompts designed to turn the generic AI model into specialized game studio personas.

---

## ✨ Features & AI Commands

The Studio Assistant currently features two specialized command modes designed to enforce strict, high-quality output formatted exactly for game production pipelines. You can trigger them by typing the command at the beginning of your prompt.

### 📜 `/narrative`

Transforms the AI into a **AAA Lead Narrative Designer**.

- **Use Case**: Generating branching dialogue, character lore, or quest descriptions.
- **Output Constraints**: Strictly enforces tone, markdown structure, and always concludes with exactly **3 distinct Player Choices** highlighting emotional or thematic consequences.

### 📦 `/asset-brief`

Transforms the AI into a **Lead Art Director**.

- **Use Case**: Translating high-level conceptual ideas into precise, highly-technical asset briefs for 3D modelers and concept artists.
- **Output Constraints**: Purely descriptive bulleted lists defining silhouette, polycount budgets, texture resolutions, and PBR material properties.

---

## 🚀 Getting Started

To run the project locally, you will need to start both the frontend and backend development servers in separate terminals.

### 1. Backend Setup (NestJS)

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

_The backend API will be available at `http://localhost:3001`._

### 2. Frontend Setup (Next.js)

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

---

## 🛠️ Testing & Building for Production

Both applications can be statically built and compiled for production environments independently.

**To build the Backend:**

```bash
cd backend
npm run build
npm run start:prod
```

**To build the Frontend:**

```bash
cd frontend
npm run build
npm run start
```

## 👱‍♂️ Development Time

- Start: 09.55 AM - 02/03/2026
- End: TBA
