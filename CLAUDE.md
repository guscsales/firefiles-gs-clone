# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev              # Start dev server on port 7879
bun build            # Production build
bun test:unit        # Run unit tests with coverage (vitest + v8)
bun test:integration # Run integration tests (Docker Postgres, real DB)
bun lint             # Biome check
bun db:generate      # Generate Drizzle migrations
bun db:push          # Push schema to database
```

Run a single test file:
```bash
bun vitest run path/to/file.test.ts
```

## Architecture

**Next.js 16 App Router** with React 19, TypeScript strict mode, Tailwind CSS 4, and shadcn/ui.

### Packages (`packages/`)

All reusable foundation code lives under `packages/`, organized by domain:

#### UI (`packages/ui/`)

- **`core-components/`** — Atomic shadcn/ui components (buttons, inputs, dialogs, etc.). New shadcn components are installed here via `components.json`. **Important**: Do not use `asChild` with `Slot` on components like `Button`. Instead, use the exported `buttonVariants()` (or equivalent variant function) directly on the target element. This avoids `React.Children.only` errors from Slot.
- **`app-components/`** — Core composed components reused across the app (`AppPageHeader`, `AppPageContent`, `DataTable`, `NavMain`).
- **`hooks/`** — Shared React hooks (`use-mobile`, `use-is-in-view`).
- **`utils.ts`** — Utility functions (`cn` for class merging).

**Import paths:**
- `@/packages/ui/core-components/button` (atomic)
- `@/packages/ui/app-components/app-page-header` (composed)
- `@/packages/ui/hooks/use-mobile` (hooks)
- `@/packages/ui/utils` (utilities)

#### Plugins (`packages/plugins/`)

- **logger** (`packages/plugins/logger/`) — Namespace-based structured logging via `createLoggerClient(namespace)`.

#### Database (`packages/plugins/database/primary/`)

- **`schemas/`** — Drizzle ORM table definitions (meetings)
- **`schema-map.ts`** — Aggregates all schemas into a single export for the Drizzle client
- **`client.ts`** — Singleton Drizzle client with global caching in development
- **`migrations/`** — Generated migration files (via `bun db:generate`)

### Factory (`packages/factory/`)

Business logic services consumed by API routes. Organized by domain:

- **`meetings/services/meeting-service.ts`** — CRUD and paginated listing for meetings. Returns `PaginatedResult<T>` with `{ data, pagination: { page, pageSize, total, totalPages } }`.

**Pattern**: Services receive typed params, query the database via Drizzle, and return typed results. Services must be library-agnostic — no HTTP, auth, or framework concerns. API routes are thin wrappers that parse request params and call services. UI consumes APIs via React Query hooks in `_hooks/` directories.

### API Error Responses

Validation errors must always return the full Zod issues array:
```ts
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
}
```
- **Always use** `parsed.error.issues` — returns the complete array of Zod issue objects (path, code, message, etc.)
- **Never use** `parsed.error.issues[0].message` or `parsed.error.flatten()`

### Data Fetching

- **Server**: React Query (`@tanstack/react-query`) with `QueryProvider` in `packages/ui/providers/query-provider.tsx`, wrapped in root layout.
- **Tables**: `@tanstack/react-table` with manual sorting/pagination. Reusable `DataTable` in `packages/ui/app-components/data-table.tsx`.
- **Hooks**: Route-scoped query hooks in `_hooks/` directories fetch from API routes.

### Data Mutation → Cache Invalidation (non-negotiable)

**Any mutation that changes data the UI displays MUST invalidate the cache so the UI reflects the new state without a manual page refresh.**

- **Server Component data**: call `router.refresh()` from `next/navigation` after the mutation resolves.
- **React Query data**: call `queryClient.invalidateQueries({ queryKey: [...] })` inside the mutation's `onSuccess`. Co-locate in the `use-<entity>` hook.
- **Both**: if a mutation affects both, do both.

### Route Conventions

- **`_components/`** — Route-scoped client components (prefixed with `_` to exclude from routing)
- **`_validators/`** — Zod schemas for form validation
- **`_hooks/`** — Route-scoped custom hooks

### Hook Naming Convention

- **`use-<entities>` (plural)** — List/query hooks. Contains `useQuery` for fetching collections with pagination, sorting, and URL state.
- **`use-<entity>` (singular)** — Mutations and entity-scoped display state. Contains `useMutation` for create, update, delete. Toasts handled inside the hook via `onSuccess`/`onError`.
- **Exported names** follow the pattern: `mutateAsync: createMeeting`, `isPending: isPendingCreatingMeeting`.

### Form Pattern

Forms use `react-hook-form` + `zod` + `useTransition` (not `useState`) for loading state. The `Input` component accepts `{...register('field')}`, `error`, and `label` props directly.

### Configuration

- **`env.ts`** — Environment variables validated with Zod (`DATABASE_URL`)
- **Path alias**: `@/*` maps to project root

## Code Style

- **Formatter**: Biome — single quotes, 2-space indent, no trailing commas, semicolons always
- **Components**: React Server Components by default; add `'use client'` only when needed
- **Date formatting**: Always use `date-fns`. Never use `toLocaleDateString()` or manual date formatting.
- **Private functions**: Prefix internal/private functions with `_` when they are not returned or exported.
- **Mobile-first**: Default styles must work at ~360px wide; `sm:`/`md:`/`lg:` progressively enhance. Verify at mobile width before declaring done.
- **Interactive elements**: All clickable elements must have `cursor-pointer` and a hover state.
- **Framer Motion animations**: All animated properties must run simultaneously in a single transition — never sequentially. Avoid `filter: 'blur()'`. Use simple `opacity` + `y` with a single easing curve. Add `as const` to cubic-bezier arrays. Never mix CSS `hover:translate-y` with Framer Motion `y` — use `whileHover={{ y: -4 }}` instead.
- **Staggered list animations**: Use `staggerContainer` (`staggerChildren: 0.1`) and `fadeUp` variant for lists.

## Testing

### Commands

```bash
bun run test:unit         # Unit tests (Vitest + happy-dom, fast, no DB)
bun run test:integration  # Integration tests (spins up Docker Postgres, runs against real DB, cleans up)
bun lint                  # Biome linter
```

Both commands must pass before any commit.

### Test-Driven Development (TDD) — Non-negotiable

**All feature and bugfix work MUST follow TDD.** Write tests first, watch them fail, then implement until they pass.

1. **Red** — Write a failing test that describes the expected behavior.
2. **Green** — Write the minimal code to make the test pass.
3. **Refactor** — Clean up while keeping tests green.

Do not write implementation code before its corresponding test exists. This applies to services, API routes, hooks, and utilities. UI components that are purely presentational (no logic, no side effects) are exempt.

### Test Strategy

**Frontend (unit tests — `*.test.ts(x)`):**
- Render real component trees (dialog → form → button, DataTable → columns → badges)
- Mock only the API boundary (`fetch`) — everything above it runs for real
- Test user flows end-to-end within the component: click → type → submit → verify DOM changes
- Hooks tested with `renderHook` from `@testing-library/react` + mocked `fetch`
- No mocking React Query, nuqs, or component internals

**Backend (integration tests — `*.integration.test.ts`):**
- Service tests hit a real Docker Postgres — no Drizzle mock chains
- Prove SQL actually works: insert → select → verify, pagination, sorting, edge cases
- Mock only external third-parties (Anthropic API, etc.) — anything outside our system boundary
- Each test cleans up its data in `beforeEach`
- Config: `vitest.integration.config.ts` (node env, 30s timeout, no parallelism)
- Infrastructure: `scripts/run-integration-tests.sh` spins up Docker Postgres on port 5555, pushes schema, runs tests, cleans up

### Framework

- **Framework**: Vitest with happy-dom environment and `@testing-library/react`
- **Setup**: `vitest.setup.ts` imports `@testing-library/jest-dom`
- **Unit tests**: `__tests__/` directories, files named `*.test.ts(x)`
- **Integration tests**: `__tests__/` directories, files named `*.integration.test.ts`
- **Mocking**: Use `vi.mock()` for module mocks; mock `@/env` in unit tests that import modules using env. Use `vi.hoisted()` when mocks reference variables.
- **User events**: Use `@testing-library/user-event` for simulating user interactions

### Test Quality Standards

Tests must validate **error and edge cases**, not only the happy path.

- **API route tests**: Assert validation error response **body shape** — `body.error` must be an array of Zod issue objects. Never just check status code.
- **Service tests**: Integration tests against real DB. No mock chains for Drizzle query builder.
- **Hook tests**: Test with `renderHook` + `QueryClientProvider` wrapper. Verify fetch calls, cache invalidation, and error handling.
- **Component tests**: Render real component trees. Test user-visible behavior, not internal rendering APIs.
- **Don't test constants**: If a constant is already tested implicitly by another test (e.g. API route uses the validator constants), don't write a separate test for the constant values.

### Validation After Changes

After creating or modifying files, always run the full test suite and linter:

```bash
bun run test:unit   # Run ALL unit tests
bun lint            # Run Biome on entire codebase
```

Run integration tests when backend service logic changes:
```bash
bun run test:integration  # Requires Docker
```

Auto-fix formatting issues:
```bash
npx biome check --write <file-or-directory-paths>
```

### No Regressions — All Tests Must Pass

**Non-negotiable**: Every task ends with `bun run test:unit` green. Zero failing tests. Zero skipped tests. Never `.skip` or `.only` a failing test to ship. Never delete a test just because it fails.
