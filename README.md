# FounderBox AI

Plan. Test. Migrate. Remember.

FounderBox AI is a production-shaped AI workspace for SaaS founders, product builders, agencies, QA teams, and small business software teams. It combines shared project memory, specialized AI agents, durable backend APIs, encrypted workspace credentials, and database-backed project state.

## Core Agents

- Founder Black Box: shared project memory, source-backed mock answers, manual memory capture, and source cards.
- AI PM Agent: product plan generation with PRD sections, roadmap, schema notes, sprint tasks, risks, and metrics.
- AI QA Agent: QA workflow with progress steps, issue table, memory save, JSON/copy, and XLSX export.
- AI Migration Agent: file upload demo, mapping suggestions, mapping review, validation report, final preview, and XLSX export.

## Features

- Premium dark SaaS landing page.
- Auth.js login and signup with local demo fallback when no database is configured.
- Dashboard shell with sidebar, topbar, project switcher, search, user menu, and mobile menu.
- Project list with create, edit, delete, search, filter, and backend persistence.
- Project overview with memory health, active agents, latest outputs, decisions, files, and suggested actions.
- Founder Black Box memory timeline, ask-memory flow, add-memory form, and demo source references.
- PM, QA, and Migration agent workflows with server-side AI calls, backend fallback, and persisted agent runs.
- Files vault with generated files, upload demo, view/download/delete actions.
- Reports area with filters, view dialog, and mock downloads.
- Integration cards with backend readiness status and encrypted OpenAI workspace-key storage.
- Settings for profile, workspace, appearance, agent rules, data/security warnings, and billing preview.

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Framer Motion
- lucide-react
- react-hook-form
- zod
- sonner
- date-fns
- fflate for safe XLSX ZIP generation
- Prisma + Postgres
- Auth.js / NextAuth
- S3-compatible storage helper

## Routes

- `/`
- `/login`
- `/signup`
- `/app`
- `/app/dashboard`
- `/app/projects`
- `/app/projects/[projectId]`
- `/app/projects/[projectId]/memory`
- `/app/projects/[projectId]/agents`
- `/app/projects/[projectId]/agents/pm`
- `/app/projects/[projectId]/agents/qa`
- `/app/projects/[projectId]/agents/migration`
- `/app/projects/[projectId]/files`
- `/app/projects/[projectId]/reports`
- `/app/integrations`
- `/app/settings`

Demo project links use `demo-phere`, `demo-qaagent`, and `demo-zybra`.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Backend

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Minimum production variables:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=change_me
NEXTAUTH_URL=http://localhost:3000
CREDENTIAL_ENCRYPTION_KEY=change_me
OPENAI_API_KEY=optional_platform_key
OPENAI_MODEL=gpt-4.1-mini
```

Database setup:

```bash
npm run db:generate
npm run db:push
```

S3-compatible file storage is enabled when these are configured:

```env
S3_BUCKET=
S3_REGION=
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

If `DATABASE_URL` is missing, the app uses seeded demo fallback data so local development still works. Production should configure Postgres, Auth.js secret, and credential encryption.

## API Routes

Backend routes:

- `GET /api/state`
- `GET/POST /api/projects`
- `PATCH/DELETE /api/projects/[projectId]`
- `GET/POST /api/memory`
- `POST /api/agents/pm`
- `POST /api/agents/qa`
- `POST /api/agents/migration`
- `POST /api/memory/ask`
- `GET /api/agent-runs/[runId]`
- `GET/POST /api/files`
- `DELETE /api/files/[fileId]`
- `GET/POST /api/reports`
- `POST /api/artifacts`
- `PATCH /api/settings`
- `POST /api/integrations/credentials`
- `GET /api/integrations/status`

AI routes resolve a workspace OpenAI key from the encrypted credential vault first, then fall back to the platform `OPENAI_API_KEY`. If no key exists or the provider fails, routes return fallback output with `mode: "mock"`. If the provider succeeds, routes return `mode: "live"`.

Never put AI keys in `NEXT_PUBLIC_*` variables. Browser-visible environment variables leak to users.

## Current Limits

- Founder Black Box answers and agent outputs use deterministic fallback when no live AI key is configured.
- QA progress is workflow/UI driven; real Playwright execution remains a worker phase.
- Migration parsing uses sample/structured data paths; full file parsing workers remain a worker phase.
- OAuth connection flows for GitHub, Gmail, Calendar, Drive, Notion, and Slack are status-ready but not fully connected.
- Billing and workspace security surfaces.

## Backend Roadmap

- Billing, team invitations, and richer workspace roles.
- Vector/search index for Founder Black Box retrieval.
- File parsing workers and presigned upload/download URLs.
- Real Playwright QA jobs with screenshots, retries, and observability.
- Migration job queue, validation rules engine, and export history.
- OAuth integrations for GitHub, Gmail, Calendar, Drive, Notion, and Slack.
- Background jobs, scheduling, webhooks, and admin monitoring.

## Testing Commands

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

Manual/browser checks were run against all required routes and core flows: auth validation, PM generation, QA simulation, migration mapping, and integration modal.

## Folder Structure

```text
src/app                 App Router routes
src/components/app      Dashboard shell, sidebar, topbar
src/components/sections Public/auth sections
src/components/ui       Reusable UI primitives
src/lib                 Data hooks, server services, agents, exports, validation
prisma                  Production database schema
src/types               Product data models
```

## Design Notes

See `DESIGN.md` for the FounderBox AI visual rules, palette, component behavior, and demo-honesty guidelines.
