# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev              # Start dev server on port 2609
bun build            # Production build
bun test             # Run all tests (unit + integration)
bun test:unit        # Run tests with coverage (vitest + v8)
bun test:integration # Integration tests (requires Docker)
bun lint             # ESLint
bun db:generate      # Generate Drizzle migrations (use for real schema changes)
bun db:push          # Push schema to database (auto tests only, not for real changes)
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

- **`core-components/`** — Atomic shadcn/ui components (buttons, inputs, dialogs, etc.). Do not place composed components here. New shadcn components are installed here via `components.json`. **Important**: Do not use `asChild` with `Slot` on components like `Button`. Instead, use the exported `buttonVariants()` (or equivalent variant function) directly on the target element (e.g., `<Link className={cn(buttonVariants({ size: 'sm' }))}>`). This avoids `React.Children.only` errors from Slot.
- **`app-components/`** — Core composed components reused across the app (e.g., `AppPageHeader`, `AppPageContent`, `AppSidebar`). These combine multiple `core-components/` primitives into higher-level building blocks.
- **`hooks/`** — Shared React hooks (e.g., `use-mobile`).
- **`utils.ts`** — Utility functions (`cn` for class merging).

**Import paths:**
- `@/packages/ui/core-components/button` (atomic)
- `@/packages/ui/app-components/app-sidebar` (composed)
- `@/packages/ui/hooks/use-mobile` (hooks)
- `@/packages/ui/utils` (utilities)

#### Plugins (`packages/plugins/`)

Modular plugins using factory functions. Each plugin lives in its own directory with colocated `__tests__/` folders.

- **config** (`packages/plugins/config.ts`) — Loads `codegus-config.json` from project root with caching. Provides `getCMSBasePath()` and `getAuthenticatedPaths()`.
- **logger** (`packages/plugins/logger/`) — Namespace-based structured logging via `createLoggerClient(namespace)`.
- **cms** (`packages/plugins/cms/`) — Markdown file CMS via `createCMSClient(options)`. Parses frontmatter with gray-matter, supports GFM. Exposes `getOGURLs(context, page)` for building OG URLs in page metadata.
- **OG images** — Generated via `inventra/og` (SDK sub-export). The per-project theme lives in `packages/plugins/config.ts` as `inventraOGTheme`; routes sit at `app/api/og/[context]/[page]/route.tsx`, `app/api/og/blog/[slug]/route.tsx`, and `app/api/og/docs/[[...slug]]/route.tsx`. See `/docs/sdk/og-images` for the full walkthrough.
- **core-components** (`packages/plugins/core-components/`) — Shared React components. `Markdown` component wraps react-markdown with rehype-sanitize and Tailwind prose styling.

### Database (`packages/plugins/database/primary/`)

- **`schemas/`** — Drizzle ORM table definitions (users, sessions, accounts, verifications, organizations, members, invitations)
- **`schema-map.ts`** — Aggregates all schemas into a single export for the Drizzle client
- **`client.ts`** — Singleton Drizzle client with global caching in development
- **`migrations/`** — Generated migration files (via `bun db:generate`)

### Auth System (`packages/plugins/auth/`)

- **`auth.ts`** — Better Auth server config with `organization()`, `nextCookies()` plugins, email/password with server-side password strength validation. Cookie prefix is read from `package.json` name.
- **`auth-client.ts`** — Client-side auth client via `createAuthClient()`
- **`auth-guard.ts`** — `requireSession(redirectPath?)` for server-side session validation. `requireAbility(action, subject, redirectPath?)` for role-based page protection using CASL.
- **`auth-service.ts`** — Server-side session helper via `getSession()`. Returns enriched session with computed fields (e.g., `user.initials`). Use this in pages/components that need session data.
- **`app/api/auth/[...all]/route.ts`** — Next.js API route handler for Better Auth
- **`proxy.ts`** — Next.js 16 proxy that redirects unauthenticated users to `/auth/login?r=<origin>` for paths matching `authenticatedPaths` in `codegus-config.json`

**Important**: `proxy.ts` provides optimistic redirects only. Always validate the session in each protected page/route using `requireSession()` from `packages/plugins/auth/auth-guard.ts` — do not rely solely on the proxy for auth checks.

### Authorization (`packages/plugins/authorization/`)

Role-based access control powered by CASL v6.

- **Roles**: `admin` (full access) and `user` (default, org-scoped). The `role` field on the `user` table defaults to `'user'`. `'admin'` is the elevated role.
- **CASL**: Abilities are defined in `packages/plugins/authorization/abilities.ts` via `defineAbilitiesFor(role)`. Subjects: `Dashboard`, `Organization`, `User`, `Content`, `Settings`.
- **Server-side**: Use `requireAbility(action, subject)` from `auth-guard.ts` in server components to protect pages. `bindSession()` automatically attaches `ability` to the session.
- **Client-side**: Wrap with `<AbilityProvider role={role}>` (already in admin layout). Use `useAbility()` hook in client components for `ability.can(action, subject)` checks.
- **Adding new roles**: Add a new block in `defineAbilitiesFor()` in `abilities.ts`. The function is the single source of truth for all permissions.
- **Admin pages**: Dashboard, All Organizations, and All Users pages are guarded with `requireAbility` at the page level. Common `user` role is redirected to their first organization's contents page after login.

### Factory (`packages/factory/`)

Business logic services consumed by API routes. Organized by domain:

- **`organizations/services/organization-service.ts`** — CRUD and paginated listing for organizations. Returns `PaginatedResult<T>` with `{ data, pagination: { page, pageSize, total, totalPages } }`.
- **`users/services/user-service.ts`** — CRUD and paginated listing for users. Validates unique email on create/update.
- **`users/services/user-organization-service.ts`** — Manages user–organization membership. `listUserOrganizations`, `syncUserOrganizations` (diff-based add/remove), `listAllOrganizations`.

**Pattern**: Services receive typed params, query the database via Drizzle, and return typed results. Services must be library-agnostic — no HTTP, auth, or framework concerns. API routes in `app/api/` are thin wrappers that parse request params and call services. UI consumes APIs via React Query hooks in `_hooks/` directories.

### Credentials vs Integrations

The organization metadata stores a `credentials` key (encrypted via AES-256-GCM with `ev:` prefix). Internally, credentials contain **all** third-party configuration — both public keys and secret keys. However, the **public API never exposes raw credentials**. Instead:

- **Integrations** (public, exposed via API): Public third-party keys safe to share with client websites — e.g., Google Analytics Measurement ID, Meta Pixel ID, GTM Container ID. The `GET /api/organizations/[id]` endpoint returns these under an `integrations` property, cherry-picked from the decrypted credentials.
- **Credentials** (private, never exposed): Secret API keys, tokens, and passwords for server-side integrations — e.g., Stripe secret keys, OAuth tokens. These are only used internally by backend services and are never included in API responses.

When adding a new third-party integration:
1. Store its config inside the existing `credentials` object in metadata (encrypted)
2. If the value is a **public key** (safe for client websites), add it to the `integrations` mapping in the GET endpoint
3. If the value is a **secret key**, do NOT add it to the API response — consume it only in server-side code

### API Error Responses

Validation errors must always return the full Zod issues array:
```ts
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
}
```
- **Always use** `parsed.error.issues` — returns the complete array of Zod issue objects (path, code, message, etc.)
- **Never use** `parsed.error.issues[0].message` (loses all but the first error) or `parsed.error.flatten()` (different shape, harder to consume)

### Data Fetching

- **Server**: React Query (`@tanstack/react-query`) with `QueryProvider` in `packages/ui/providers/query-provider.tsx`, wrapped in admin layout.
- **Tables**: `@tanstack/react-table` with manual sorting/pagination. Reusable `DataTable` component in `packages/ui/app-components/data-table.tsx`.
- **Hooks**: Route-scoped query hooks (e.g., `app/admin/organizations/_hooks/use-organizations.ts`) fetch from API routes.

### Data Mutation → Cache Invalidation (non-negotiable)

**Any mutation that changes data the UI displays MUST invalidate the cache so the UI reflects the new state without a manual page refresh.** "It works after I reload" is a bug, not a feature.

Pick the right tool for the data source:

- **Server Component data** (anything read by RSCs via `getSession()`, direct DB queries, etc.): call `router.refresh()` from `next/navigation` after the mutation resolves. Pair this with **syncing the DB inline in the API route** when the mutation depends on a third-party webhook (Stripe, etc.) — otherwise `router.refresh()` re-fetches stale rows because the webhook hasn't fired yet. See `app/api/stripe/cancel/route.ts` + `app/api/stripe/resume/route.ts`: both call `syncSubscriptionToOrg(sub)` immediately after the Stripe API returns, so the next read sees the new state.
- **React Query data** (anything read via `useQuery` hooks): call `queryClient.invalidateQueries({ queryKey: [...] })` inside the mutation's `onSuccess`. Co-locate this in the `use-<entity>` hook — don't push invalidation logic to the component.
- **Both**: if a mutation affects both a server-component read AND a `useQuery`, do both. Do not pick one and hope the other catches up.

Anti-patterns to reject in code review:

- Returning 200 from a mutation route without persisting the resulting state, then relying on a webhook to sync the DB "eventually" while the client immediately re-reads.
- Telling the user to refresh the page.
- `router.push(samePath)` as a substitute for `router.refresh()` — it does not revalidate the RSC cache.
- Storing API response data in a `useState` and treating it as truth instead of invalidating the query that should own that data.

### Route Conventions

- **`_components/`** — Route-scoped client components (prefixed with `_` to exclude from routing)
- **`_validators/`** — Zod schemas for form validation
- **`_hooks/`** — Route-scoped custom hooks

### Hook Naming Convention

- **`use-<entities>` (plural)** — List/query hooks (e.g., `useOrganizations`). Contains `useQuery` for fetching collections with pagination, sorting, and URL state.
- **`use-<entity>` (singular)** — Mutations and entity-scoped display state (e.g., `useContent`). Contains `useMutation` for create, update, delete, and may include `useQuery` for fetching by ID. Returns data ready for display (e.g., image URLs already resolved via `getPublicBlobUrl`). Toasts are handled inside the hook via `onSuccess`/`onError` callbacks.
- **`use-<entity>-generation` (generation hooks)** — AI generation orchestration only (e.g., `useContentGeneration`). After generating data, persist it via API and invalidate the relevant query so the entity hook picks up the new data. Never hold display state — that belongs to the entity hook/query.
- **Exported names** follow the pattern: `mutateAsync: createOrganization`, `isPending: isPendingCreatingOrganization`, `error: createOrganizationError`.

The query (`useQuery`) is the single source of truth for display data. Generation hooks produce data, persist it, and invalidate the cache.

### Form Pattern

Forms use `react-hook-form` + `@hookform/resolvers/zod` + `useTransition` (not `useState`) for loading state. The `Input` component accepts `{...register('field')}`, `error`, and `label` props directly.

### Configuration

- **`env.ts`** — Environment variables validated with Zod
- **Path alias**: `@/*` maps to project root

## Code Style

- **Formatter**: Biome — single quotes, 2-space indent, no trailing commas, semicolons always
- **Linter**: ESLint with next/core-web-vitals and next/typescript configs
- **Components**: React Server Components by default; add `'use client'` only when needed
- **Date formatting**: Always use `date-fns` (`format`, `formatDistance`, etc.) for date formatting. Never use `toLocaleDateString()` or manual date formatting.
- **Private functions**: Prefix internal/private functions with `_` (e.g., `_processStream`, `_parseTitleExcerptAndContent`) when they are not returned or exported. This makes it easy to identify helper functions that are internal to a hook or module.
- **Mobile-first**: every UI change ships mobile-friendly. Default styles must work at the smallest breakpoint (~360px wide); `sm:`/`md:`/`lg:` modifiers progressively enhance for larger screens. Before declaring a UI task done, open it at mobile width (DevTools or the running cloudflare tunnel) and confirm: nothing overflows horizontally, tap targets are ≥44px, sticky elements don't cover the active interaction, and any new menu/drawer/dialog opens and dismisses correctly. Verifying only on a desktop viewport is not sufficient.
- **Interactive elements**: All clickable/interactive elements must have `cursor-pointer` and a hover state (e.g., `hover:bg-*`, `hover:opacity-*`). This applies to buttons, links, accordion triggers, cards, and any element with an `onClick` or navigation behavior.
- **Alignment & visual polish**: Respect the visual rhythm of every UI we ship. When placing a control next to a form field (e.g. a remove/trash button beside an input), align the control with the field's bottom edge using `flex items-end` rather than hand-tuned `mt-*` offsets — magic margins drift the moment the label or input height changes. Match icon-button sizing/variants to existing patterns in the codebase (e.g. the `destructive-light` + `icon-sm` pair used in [posting-schedule-sheet.tsx](app/admin/(app)/organizations/[orgId]/contents/_components/posting-schedule-sheet.tsx) for row-remove actions) so similar interactions look identical across the admin. Treat alignment, spacing, and variant consistency as part of the work — not a follow-up polish pass.
- **Framer Motion animations**: All animated properties (opacity, y, scale, etc.) must run simultaneously in a single transition — never sequentially. Avoid `filter: 'blur()'` in motion variants as it causes sequential rendering. Use simple `opacity` + `y` with a single easing curve. Always add `as const` to cubic-bezier arrays to satisfy TypeScript. Never mix CSS `hover:translate-y` with Framer Motion `y` animations — use `whileHover={{ y: -4 }}` instead, as CSS transforms conflict with Framer Motion's transform management.
- **Staggered list animations**: Whenever rendering a list of stacked elements (cards, accordion items, grid items, etc.), always use staggered entrance animations — wrap the container with `staggerContainer` (`staggerChildren: 0.1`) and each item with `fadeUp` variant. Items should appear one after another, not all at once. See the Products section cards and FAQ accordion for reference patterns.

## Internationalization (i18n)

**Non-negotiable**: Every new piece of user-facing copy must live in a dictionary, never hardcoded in components, hooks, validators, metadata, or toasts.

- **Where copy lives**:
  - Public site (`app/(www)/**`) → `app/(www)/_i18n/dictionaries/{en,pt}.json`
  - Admin / auth / setup (`app/admin/**`, `app/auth/**`, `app/admin/setup/**`) → `app/admin/_i18n/dictionaries/{en,pt}.json`
- **How to read it**:
  - Client components: `const { t } = useI18n()` from `@/packages/plugins/i18n`
  - Server components, route handlers, `generateMetadata`: `const { t } = await getI18n()` from the matching `_i18n/server.ts`
- **Key style**: Flat, lowercase, underscore-separated (e.g. `admin_orgs_form_label_name`). Never nest objects, never use dots. Namespace by feature (`admin_orgs_*`, `admin_account_*`, `auth_login_*`, `setup_*`, etc.).
- **Toast strategy**: Per-entity success keys (`admin_toast_org_created`, `admin_toast_user_updated`) so PT verb agreements work cleanly. Generic catch-all only for unknown errors.
- **Validators**: Zod schemas store dictionary keys in `.message`; the consuming component translates via `t(errors.field?.message)`. Do not hardcode English in validators.
- **Page metadata**: Convert `metadata` → `generateMetadata()` and pull title/description from the dictionary.
- **Dictionary parity**: `en.json` and `pt.json` must contain the exact same set of keys. When you add a key in one file, add the matching value to the other in the same edit.
- **Date formatting**: Pull the active locale via `useDateLocale()` (admin) and pass it to `date-fns` (`formatDistance(date, now, { locale })`). Never render relative timestamps without a locale argument.

## Testing

**Important**: Always create automated tests (unit or integration) when adding new features, services, hooks, or components. Choose the test type based on what's being tested:
- **Unit tests** for UI components, hooks, and pure logic (mocked dependencies)
- **Integration tests** for database services and API flows (real database)

- **Framework**: Vitest with jsdom environment and `@testing-library/react`
- **Setup**: `vitest.setup.ts` imports `@testing-library/jest-dom`
- **Pattern**: Tests in `__tests__/` directories, files named `*.test.ts(x)`
- **Fixtures**: Test data in `__tests__/fixtures/` directories
- **Mocking**: Use `vi.mock()` for module mocks; mock `@/env` in tests that import modules using env
- **User events**: Use `@testing-library/user-event` for simulating user interactions in component tests
- **Integration tests**: `*.integration.test.ts` files, separate `vitest.integration.config.ts` (Node environment, 30s timeout), Docker postgres:17 container lifecycle managed by pre/post scripts

### Test Quality Standards

**Critical**: Tests must validate **error and edge cases**, not only the happy path. A test suite that only covers success scenarios is incomplete and will miss real bugs.

- **API route tests**: Always assert the validation error response **body shape** — `body.error` must be an array of Zod issue objects (each with `message` and `path`). Never just check the status code. Test each required field individually for rejection (missing field, wrong type, empty string).
- **Schema validation**: Verify that invalid input types are rejected (e.g., passing a string where a number is expected, passing a pathname where a URL was expected, or vice versa).
- **Integration tests are mandatory** for database services and API flows. They must cover: creation, update, deletion, uniqueness constraints, and invalid input handling. Do not rely solely on unit tests with mocked dependencies for services that interact with the database.
- **Service tests**: When a service transforms data (e.g., converting full URLs to pathnames), test that the output matches the expected format — not just that it "returns something".

### Validation After Changes

**Important**: After creating or modifying files, always run the full test suite and linter to verify nothing is broken — not just the tests for the files you changed.

```bash
bun run test:unit   # Run ALL unit tests (not just new ones)
bun lint            # Run linter/formatter on entire codebase
```

If lint reports formatting or import order issues in new files, auto-fix them:
```bash
npx biome check --write <file-or-directory-paths>
```

Then re-run `bun run test:unit` to confirm tests still pass after formatting fixes.

### No Regressions — All Tests Must Pass

**Non-negotiable**: Every task ends with `bun run test:unit` green. Zero failing tests. Zero skipped tests added to cover breakage. No "pre-existing failures" excuse — if you touch the repo and the suite is red at the end, you own the fix.

- If a test breaks after a change you made, fix the test or fix the code — do not leave it red.
- If a test is already red when you arrive, still fix it. Regressions accumulate silently when everyone treats "unrelated failures" as someone else's problem.
- Never `.skip` or `.only` a failing test to ship. Never delete a test just because it fails — update it to match current behavior, or restore the behavior it was protecting.
- Never claim work is "done" without running the full suite and seeing it pass. The build compiling is not enough; the production build passing is not enough.
- Pre-existing failures caused by environment setup (missing `@/env` mocks, missing DOM polyfills like `IntersectionObserver`) get fixed at the root: update `vitest.setup.ts` or the test's mock setup so the whole suite stays green.

## Billing & Plans

Plan definitions are the single source of truth in `packages/factory/plans/plans-config.ts`. The public `/pricing` page, the admin `/admin/billing` UI, the Stripe checkout session, and the limits factory all read from the same `PLANS` map.

- **Adding a new plan**: append the id to `PLAN_IDS`, populate `PLANS[id]` with prices (raw numeric amount per currency), Stripe price IDs (read from env), `limits` (`contents_per_month`, `seats` — null = unlimited), trial duration, and i18n keys for the editorial copy. Add a tier card to `app/(www)/pricing/_components/pricing-tiers.tsx` (it auto-renders from `PLAN_IDS`). Add the matching `pricing_tier_<id>_*` keys to `app/(www)/_i18n/dictionaries/{en,pt}.json` (parity required). Create the Stripe Price IDs in the Stripe dashboard and set the env vars in `env.ts`.
- **Limits enforcement**: services that mutate state call `assertWithinLimit({ orgId, key })` from `packages/factory/limits/limits-service.ts`. On hit, throws `LimitReachedError` with `{ code, key, planId, limit, used }` — API routes catch it and return 402 with the structured payload for the upsell prompt.
- **Stripe lives in `packages/plugins/stripe/`** — embedded checkout, portal session, and webhook signature verification. The webhook route handler at `app/api/stripe/webhook/route.ts` returns 200 within ~50ms after dispatching to `stripe-process-event` (Trigger.dev). DB sync + email fan-out run inside the task. Idempotency = single-row insert into the `stripe_event` PK table.
- **Trial-end gate**: `requireBillingActive(pathname)` in `packages/plugins/auth/auth-guard.ts` runs in `app/admin/(app)/layout.tsx` and redirects `past_due`/`canceled`/`unpaid` to `/admin/billing`. The pathname is read from the `x-pathname` request header which `proxy.ts` sets per request.
- **Locale-aware billing emails**: templates under `packages/plugins/email/templates/billing-templates/` accept a `locale: 'en' | 'pt'` prop. The `stripe-send-billing-email` Trigger task resolves the recipient + locale via `getBillingRecipientForOrg` (org owner, user metadata locale).
- **Trial reminders**: `trial-reminders.ts` is a daily cron (`0 12 * * *`) that sweeps trialing orgs and dispatches d-3 / d-1 / d+0 emails.
- **Env vars**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STANDARD`, `STRIPE_PRICE_SCALE`. One Stripe Price ID per product — Stripe's multi-currency Price (currency_options) handles USD + BRL on the same id. The checkout session passes `currency` at the top level so Stripe selects the right currency_options entry. Studio is contact-sales — no Stripe price.
- **Local Stripe testing**: `stripe listen --forward-to http://localhost:2609/api/stripe/webhook` then `stripe trigger customer.subscription.{created,updated,deleted}` / `invoice.payment_{succeeded,failed}`. Test card `4242 4242 4242 4242` for happy path, `4000 0025 0000 3155` for `failed_auth`.

## Superpowers Skills

Use the installed **superpowers** skills for structured development workflows:

- **TDD** (`superpowers:test-driven-development`): Always use when implementing features or fixing bugs. Write failing test first, then minimal code to pass.
- **Code Review** (`superpowers:requesting-code-review`): Use after completing major features or before merging. Dispatch the code-reviewer subagent.
- **Brainstorming** (`superpowers:brainstorming`): Use before any creative work — features, components, or behavior changes.
- **Debugging** (`superpowers:systematic-debugging`): Use when encountering bugs or unexpected behavior before proposing fixes.
- **Verification** (`superpowers:verification-before-completion`): Always run verification commands before claiming work is complete.

# Trigger.dev

Use the installed **triggerdotdev** skills necessary.
