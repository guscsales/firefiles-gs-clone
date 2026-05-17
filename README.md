# Fireflies Tech Challenge

## How to run

### Prerequisites

- Node.js 22+
- Docker
- Bun (`npm install -g bun`)
- An [Anthropic API key](https://console.anthropic.com/)
- *(Optional)* A [Replicate API key](https://replicate.com/) — if `REPLICATE_API_KEY` is set, uploaded files are transcribed with OpenAI Whisper via Replicate. If absent, a mock transcription is used instead.
- A test video file `video-for-testing/gitlab-public-meeting.mp4` is included in the repo root for easy testing.

### Setup

```bash
# 1. Start Postgres
docker compose up -d

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and add your real Anthropic API key

# 3. Install dependencies
bun install

# 4. Push database schema
bun db:push

# 5. Start dev server
bun dev
# → http://localhost:7879
```

### Running tests

```bash
bun run test:unit          # Unit tests (Vitest + happy-dom)
bun run test:integration   # Integration tests (spins up Docker Postgres, runs against real DB, cleans up)
bun lint                   # Biome linter
```

## Live Demo

- **App**: https://firefiles-gs-clone.vercel.app
- **Product demo**: https://www.tella.tv/video/firefiles-demo-ai-meeting-transcription-and-summary-demo-duu6
- **Build process & decisions**: https://www.tella.tv/video/firefiles-demo-my-process-and-decisions-6btn

# Decisions

## Guiding principles

- This is an MVP under a 10h time budget. Real user value comes first, polish comes second, completeness comes last.
- Use only the libraries strictly needed. I know there are many more options, but keeping the surface area small is the decision.
- Document trade-offs explicitly. What I chose not to do matters as much as what I did.
- I’ll use Claude Code as AI agent together with rules on [CLAUDE.md](http://CLAUDE.md) for a better experience on development.

## Technical decisions

### 1. Stack: TypeScript + Next.js 16 on App Router

- One fullstack codebase.
- Deploys to Vercel in one click, same place I'm already shipping the database and storage from, so zero infra glue.
- I'm using my open-source boilerplate `create-my-next-idea`, which ships with the foundation already wired: shadcn/ui, app shell with header and sidebar, Drizzle + Neon. This saves the 1–2h of setup I'd otherwise burn before writing a single feature.

### 2. Database: Neon Postgres + Drizzle

- Neon connects to Vercel in one click and is already in my boilerplate.
- Drizzle is type-safe and fast to iterate on. Schema changes don’t require a heavy migration ceremony.

### 3. Transcript storage: column in the `meetings` table

- Mock transcripts are small. Even a real Whisper output for a 30-minute meeting is ~50KB of text, which is trivial for Postgres.
- An extra Blob fetch would add latency and complexity for zero benefit at this scale.

### 4. LLM: Claude Haiku 4.5 via Anthropic SDK and Open AI Whisper vis Replicate

- Claude Haiku 4.5 is strong at structured JSON output, which I need for action items.
- The Anthropic TypeScript SDK is lightweight and straightforward to use.
- Replicate makes easier to execute many types of models, so for Open AI Whisper I chose it.
- Important to define length limits to avoid excessive token usage and potential costs.

### 5. Background AI processing with `waitUntil()`

- After a meeting is uploaded, AI processing (title, summary, action items extraction) runs in the background using `waitUntil()` from `@vercel/functions`.
- I evaluated `p-queue` first, but it breaks in Vercel serverless because in-memory queues die when the function instance is killed. `waitUntil()` keeps the function alive after the response is sent, works in both local dev and Vercel production, and requires zero extra infrastructure.
- The upload returns 201 immediately while AI processes in background. The frontend polls every 5 seconds and picks up the status change automatically.

### 6. AI output quality validation

- After the LLM extracts meeting metadata, a second AI call validates the output quality before saving it.
- This catches cases where the transcript isn't a real meeting (random audio, music, silence) — the LLM would return refusal language or hallucinated content instead of genuine meeting intelligence.
- If the quality check fails, the meeting is marked as `failed` with a clear error message visible to the user via a tooltip on the error icon.

### 7. Code patterns

I like to separate domains and responsibilities, even inside a fullstack
Next.js folder. You never know how an app will grow, and there's no silver
bullet, but you can keep the ground prepared for scale without creating too
much pain upfront. So I divide the project like this:

- **`app/`** — pages and the components used by those pages. Consumes from
  the `packages/` folder.
  - Most of the frontend part lives inside the app context like `_hooks` and other specific things. I prefer this because the frontend can be handled in different ways according the raw data received.
- **`packages/`** — holds `plugins`, `factory`, and `ui`.
  - **`plugins/`** — third-party integrations and core foundation pieces:
    database, logger, and in larger apps things like Stripe, better-auth,
    etc. Closer to infrastructure than to product logic.
  - **`factory/`** — the backend layer where business logic lives:
    services, models, constants, enums. The `app/` folder consumes from
    here.
  - **`ui/`** — the design system. Shared components live here so the app
    can pull from a single source. When something is truly local to one
    page, I put it in a `_components` folder next to that page instead.
- **`__tests__/`** — tests live here, mirroring the source file structure
  so each test points clearly to what it covers.
- All of these conventions are documented in `CLAUDE.md` so the AI follows
  the same patterns I do.

### 8. Automated Tests Structure

#### Frontend (unit + component integration):

The decision here is to make sure the components are working and requesting correctly what's necessary.

- Render real component trees (dialog → form → button, DataTable → columns → badges)
- Mock only the API boundary (fetch), everything above it runs for real
- Test user flows end-to-end within the component: click, type, submit, verify DOM changes
- Hooks tested with renderHook + mocked fetch

#### Backend (integration against real DB):

The script `bash scripts/run-integration-tests.sh` instantiate a temporary postgres and push the schema there, so it's possible to test real situations without mock the DB and have more resilient tests.

- Service tests hit a real Docker Postgres, no Drizzle mock chains
- Prove SQL actually works: insert, select, verify, pagination, sorting, edge cases, business logic
- Mock only external third-parties (Anthropic API, etc.) and anything outside your system boundary
- API route tests can use real service + real DB too, mocking only third-party calls

## Used libraries (and why)

- **Next.js (on Vercel)** — one codebase for frontend, API routes, and server logic. One deploy.
- **TypeScript** — it’s the language I have more knowledge and “code hours” - I think keep simple to validate strong typing and other things.
- **Postgres (Neon) + Drizzle** — Neon is serverless Postgres that connects to Vercel in one click. I picked Drizzle in this case because it generates types directly from the schema without a separate codegen step and it’s easy to create queries “like SQL".
- **shadcn/ui + Tailwind CSS** — shadcn gives me plug-n-play components I own and can edit in place, and I already have my DS based on that. Tailwind keeps styling next to the markup and uses the design tokens already wired in my boilerplate.
- **React Query (TanStack Query)** — I chose React Query over Server Actions for data fetching and mutations. It gives me encapsulated request logic per hook, built-in polling (used for status transitions from `processing` to `ready`|`failed`), and a cache system that mutations can invalidate on success. Server Actions don’t offer the same level of organization for complex client-side state, with React Query I can co-locate queries, mutations, cache invalidation, and error handling in a single hook file per domain, which keeps the codebase predictable as it grows.
- **React Hook Form + Zod** — Both libraries works really well with typescript and between them it allows to do easy validations and make sure APIs requests are data-safe.
- **Vitest + React Testing Library** — Vitest because the boilerplate already uses it, it’s fast and solves the problem. RTL because it tests what the user sees, not how the component is wired internally. Goal for AI here (Claude Code in may case) will do TDD always.

## Out of scope (and why)

- **Authentication + Multi-tenant:** Single-user demo. In production I'd use Better Auth, but adds nothing for a code review.
- **Job queues / retry orchestration:** Background processing uses `waitUntil()` which is sufficient for this scope. A production system would add Trigger.dev or similar for retries, dead letter queues, and multi-step orchestration.

## Estimated time

| Activity | Estimated time |
|----------|---------------|
| Product research + task preparation | ~1h30m |
| Coding (all features, tests, infra) | ~5h |
| Deploy, final revision, cleanup | ~1h |
| **Total** | **~7h30m** |
