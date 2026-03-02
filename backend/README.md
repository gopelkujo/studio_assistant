# Studio Assistant - Backend Architecture

This is the API server for **Studio Assistant**, built with [NestJS](https://nestjs.com/). It handles routing, request validation, and streams intelligent responses from OpenAI to the client via Server-Sent Events (SSE).

## 🧠 Technical Overview for Developers

### 1. Server-Sent Events (SSE) Interface

AI responses stream token-by-token rather than waiting for the full response.

- The `/ai/generate` endpoint (in `AiController`) is decorated with `@Sse()`.
- It returns an `Observable` pipeline instead of a standard JSON promise.
- `AiService` streams tokens directly from the OpenAI API and yields each chunk to the client as it arrives.
- A `/health` endpoint is also available for production health checks.

### 2. Command Map & AI Personas

All prompt engineering lives in a single `COMMAND_PROMPTS` record object at the top of `AiService`. Each key is a command slug; the value is the full system prompt for that AI persona.

```typescript
const COMMAND_PROMPTS: Record<string, string> = {
  narrative: '...', // Lead Narrative Designer
  'asset-brief': '...', // Lead Art Director
  dialogue: '...', // Character Dialogue Writer
  'vibe-check': '...', // Visual Mood Brief
  'bug-triager': '...', // Senior QA Lead
  'quest-logic': '...', // Systems Designer
  'summarize-email': '...', // Studio Producer
};
```

To add a new command, insert one key into `COMMAND_PROMPTS` and add it to the `@IsIn([...])` validator in `GenerateCommandDto`. No other changes required.

The service resolves the prompt with:

```typescript
const systemPrompt = COMMAND_PROMPTS[dto.type] ?? COMMAND_PROMPTS['narrative'];
```

### 3. DTOs & Request Validation

All inbound payloads go through `GenerateCommandDto` (`src/ai/dto/generate-command.dto.ts`).

- `prompt` — the user's raw input text (`@IsString`, `@IsNotEmpty`)
- `type` — one of 7 validated command slugs (`@IsIn([...])`)

If `type` is not in the allowed list, the request is rejected with a 400 before it reaches the service.

### 4. Global Error Handling

Because the server streams in real-time, error handling has two modes:

- **Before headers are sent** — `GlobalExceptionFilter` returns a standard JSON error block.
- **Mid-stream** — the filter emits an `event: error` SSE chunk to tell the frontend the stream died, preventing the client from hanging indefinitely.

---

## 💻 Developer Commands

```bash
# Install dependencies
npm install

# Run development server with Hot Module Reloading
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run unit tests
npm run test
```

**Note**: You must have a `.env` file at the root of `backend/` with a valid `OPENAI_API_KEY`. Copy `.env.example` to get started:

```bash
cp .env.example .env
```
