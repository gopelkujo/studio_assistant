# Studio Assistant - Backend Architecture

This is the API server for **Studio Assistant**, built with [NestJS](https://nestjs.com/). It handles routing, parameter validation, rate-limit error mapping, and streams intelligent responses from OpenAI to the client via Server-Sent Events (SSE).

## 🧠 Technical Overview for Developers

### 1. Server-Sent Events (SSE) Interface

Because AI responses can take a while to generate, we do not wait for the entire response to assemble.

- The `/ai/generate` endpoint (in `AiController`) is decorated with `@Sse()`.
- It returns an `Observable` pipeline instead of a standard JSON Promise.
- The `AiService` streams tokens directly from the OpenAI API as they arrive and yields them to the client chunk-by-chunk.

### 2. Prompt Engineering & Domain Roles

The backend enforces strict AI constraints before sending prompts to the OpenAI model.

- See `AiService.getNarrativePrompt()` and `AiService.getAssetBriefPrompt()`.
- The user is not allowed to set their own system instructions. Instead, they provide a simple prompt and pass a `commandType` (`narrative` or `asset-brief`), and the backend wraps their query inside our highly-engineered system personas.

### 3. DTOs & Request Validation

- All inbound JSON payloads to the AI route go through the `GenerateCommandDto`.
- The `class-validator` package ensures the `type` parameter only strictly matches `'narrative'` or `'asset-brief'` before processing.

### 4. Global Error Handling

Because the NestJS server is streaming data in real-time, handling errors is slightly different:

- If an HTTP 500 or 429 (Rate Limit) occurs _before_ headers are sent, `GlobalExceptionFilter` returns a standard JSON error block.
- If an exception occurs _mid-stream_ (e.g. the OpenAI API fails halfway through generating text), the filter returns an `event: error` SSE chunk to proactively tell the frontend the stream died, rather than leaving the client hanging.

---

## 💻 Developer Commands

```bash
# Install dependencies
npm install

# Run development server with Hot Module Reloading
npm run start:dev

# Run unit tests
npm run test

# Build for production
npm run build
```

**Note**: You must have a `.env` file present at the root of `backend/` with a valid `OPENAI_API_KEY` for the application to function.
