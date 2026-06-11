# FounderBox AI

Plan. Test. Migrate. Remember.

FounderBox AI is a frontend-only Phase 1 MVP/demo for a connected AI workspace for SaaS founders, product builders, agencies, QA teams, and small business software teams. It feels like a real SaaS operating system with shared project memory and specialized agents, while staying honest that backend, database, OAuth, AI APIs, and browser automation are not connected yet.

## Core Agents

- Founder Black Box: shared project memory, source-backed mock answers, manual memory capture, and source cards.
- AI PM Agent: product plan generation with PRD sections, roadmap, schema notes, sprint tasks, risks, and metrics.
- AI QA Agent: simulated autonomous QA run with progress steps, issue table, memory save, JSON/copy, and XLSX export.
- AI Migration Agent: file upload demo, mapping suggestions, mapping review, validation report, final preview, and XLSX export.

## Features

- Premium dark SaaS landing page.
- Mock login and signup with validation.
- Dashboard shell with sidebar, topbar, project switcher, search, user menu, and mobile menu.
- Project list with create, edit, delete, search, filter, and localStorage persistence.
- Project overview with memory health, active agents, latest outputs, decisions, files, and suggested actions.
- Founder Black Box memory timeline, ask-memory flow, add-memory form, and demo source references.
- PM, QA, and Migration agent workflows with realistic local outputs.
- Files vault with generated files, upload demo, view/download/delete actions.
- Reports area with filters, view dialog, and mock downloads.
- Integration cards with demo/not-connected status and modal messaging.
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

## Demo Mode

Phase 1 now includes backend API route boundaries for AI agents, while persistence still uses localStorage:

- No real database.
- No real OAuth.
- Real AI calls are available when `OPENAI_API_KEY` is configured on the server.
- No real GitHub, Gmail, Calendar, Drive, Notion, or Slack integration.
- No real browser automation.
- No sensitive credentials are stored.

Data is seeded from `src/lib/mock-data.ts` and persisted in browser localStorage through `src/lib/mock-store.ts`.

## Backend AI Integration

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Add server-side keys:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Never put AI keys in `NEXT_PUBLIC_*` variables. Browser-visible environment variables leak to users.

Backend routes:

- `POST /api/agents/pm`
- `POST /api/agents/qa`
- `POST /api/agents/migration`
- `POST /api/memory/ask`
- `GET /api/integrations/status`

If `OPENAI_API_KEY` is missing or the provider fails, routes return the existing backend fallback output with `mode: "mock"`. If the provider succeeds, routes return `mode: "live"`.

Future user-provided API keys should not be saved in localStorage. They should be submitted through the app to a backend endpoint, encrypted, stored in the database/token vault, and used only by server routes.

## What Is Mocked

- Agent outputs and run history.
- Founder Black Box answers and source chips when no live AI key is configured.
- File uploads and generated file records.
- Reports and report downloads.
- QA browser steps and screenshots.
- Migration file parsing and final imports. AI mapping can be live, but real file workers are still backend-roadmap work.
- Integration connection/configuration flows.
- Billing and workspace security surfaces.

## Backend Roadmap

- Auth, organizations, roles, sessions, and billing.
- Hosted database for projects, memory, reports, files, and agent runs.
- Vector/search index for Founder Black Box retrieval.
- Secure file storage and file parsing workers.
- Real AI PM generation with approval and audit logs.
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
src/lib                 Mock data, store, agents, exports, validation
src/types               Product data models
```

## Design Notes

See `DESIGN.md` for the FounderBox AI visual rules, palette, component behavior, and demo-honesty guidelines.
