# Backend Integration Notes

FounderBox AI users will not receive this codebase. They will use the app. Secrets must therefore live on the backend, not in the browser.

## Where Keys Go

Create `.env.local` on the server:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
CREDENTIAL_ENCRYPTION_KEY=
DATABASE_URL=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

S3_BUCKET=
S3_REGION=
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

Do not create `NEXT_PUBLIC_OPENAI_API_KEY`. Anything prefixed with `NEXT_PUBLIC_` can be exposed to users.

## Current Backend Routes

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

These routes call the AI provider from the server using an encrypted workspace OpenAI key first, then the platform `OPENAI_API_KEY`. If no key exists or the provider fails, they return safe fallback output with `mode: "mock"`.

## Current Frontend Wiring

- PM Agent calls `/api/agents/pm`.
- QA Agent calls `/api/agents/qa` after the simulated progress steps.
- Migration Agent calls `/api/agents/migration`.
- Founder Black Box calls `/api/memory/ask`.
- Integrations page calls `/api/integrations/status`.

## Production Credential Flow

User-provided keys are implemented through `/api/integrations/credentials`:

1. User enters key in app settings/integrations.
2. Frontend submits the key once to a backend endpoint over HTTPS.
3. Backend encrypts the key with `CREDENTIAL_ENCRYPTION_KEY` or `NEXTAUTH_SECRET`.
4. Backend stores only encrypted secret material in the `Credential` table.
5. Agent routes resolve the workspace credential server-side.
6. Browser never receives the plaintext key again.

LocalStorage is not acceptable for production API keys.
