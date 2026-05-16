# Fireflies Tech Challenge

## How to run

TBD...

## Guiding principles

- This is an MVP under a 10h time budget. Real user value comes first, polish comes second, completeness comes last.
- Use only the libraries strictly needed. I know there are many more options, but keeping the surface area small is the decision.
- Document trade-offs explicitly. What I chose not to do matters as much as what I did.
- I’ll use Claude Code as AI agent together with rules on [CLAUDE.md](http://CLAUDE.md) for a better experience on development.

## Technical decisions

### 1. Stack: TypeScript + Next.js 16 on App Router

- One fullstack codebase.
- Deploys to Vercel in one click, same place I'm already shipping the database and storage from, so zero infra glue.
- I'm using my open-source boilerplate `create-my-next-idea`, which ships with the foundation already wired: shadcn/ui, app shell with header and sidebar, Drizzle + Neon, and Vercel AI Gateway for LLM calls. This saves the 1–2h of setup I'd otherwise burn before writing a single feature.

### 2. Database: Neon Postgres + Drizzle

- Neon connects to Vercel in one click and is already in my boilerplate.
- Drizzle is type-safe and fast to iterate on. Schema changes don’t require a heavy migration ceremony.

### 3. Transcript storage: column in the `meetings` table

- Mock transcripts are small. Even a real Whisper output for a 30-minute meeting is ~50KB of text, which is trivial for Postgres.
- An extra Blob fetch would add latency and complexity for zero benefit at this scale.

### 4. LLM: Claude Haiku 4.5 via Vercel AI Gateway

- Already wired in my boilerplate, so no new SDK to add.
- AI Gateway gives me a single endpoint + observability + easy model
swaps without touching app code.
- Claude Haiku 4.5 is strong at structured JSON output, which I need for action items.

## Used libraries (and why)

- **Next.js (on Vercel)** — one codebase for frontend, API routes, and server logic. One deploy.
- **TypeScript** — it’s the language I have more knowledge and “code hours” - I think keep simple to validate strong typing and other things.
- **Postgres (Neon) + Drizzle** — Neon is serverless Postgres that connects to Vercel in one click. I picked Drizzle in this case because it generates types directly from the schema without a separate codegen step and it’s easy to create queries “like SQL".
- **shadcn/ui + Tailwind CSS** — shadcn gives me plug-n-play components I own and can edit in place, and I already have my DS based on that. Tailwind keeps styling next to the markup and uses the design tokens already wired in my boilerplate.
- **Zod** — Zod is typescript-first, connects really well and allow to do easy validations and make sure APIs are data-safe.
- **Vitest + React Testing Library** — Vitest because the boilerplate already uses it, it’s fast and solves the problem. RTL because it tests what the user sees, not how the component is wired internally. Goal for AI here (Claude Code in may case) will do TDD always.

## Out of scope (and why)

- **Authentication + Multi-tenant:** Single-user demo. In production I'd use Better Auth, but adds nothing for a code review.
- **Jobs:** Since most of the transcriptions will be small, we can wait AI to solve it in a request instead of send to a [trigger.dev](http://trigger.dev) or similar.
- &nbsp;

&nbsp;
