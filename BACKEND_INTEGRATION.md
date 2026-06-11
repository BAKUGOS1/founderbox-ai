# Backend Integration Notes

FounderBox AI users will not receive this codebase. They will use the app. Secrets must therefore live on the backend, not in the browser.

## Where Keys Go

Create `.env.local` on the server:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
```

Do not create `NEXT_PUBLIC_OPENAI_API_KEY`. Anything prefixed with `NEXT_PUBLIC_` can be exposed to users.

## Current Backend Routes

- `POST /api/agents/pm`
- `POST /api/agents/qa`
- `POST /api/agents/migration`
- `POST /api/memory/ask`
- `GET /api/integrations/status`

These routes call the AI provider from the server when `OPENAI_API_KEY` is configured. If the key is missing or the provider fails, they return safe fallback output with `mode: "mock"`.

## Current Frontend Wiring

- PM Agent calls `/api/agents/pm`.
- QA Agent calls `/api/agents/qa` after the simulated progress steps.
- Migration Agent calls `/api/agents/migration`.
- Founder Black Box calls `/api/memory/ask`.
- Integrations page calls `/api/integrations/status`.

## Production Credential Plan

For user-provided keys:

1. User enters key in app settings/integrations.
2. Frontend submits the key once to a backend endpoint over HTTPS.
3. Backend encrypts the key with a managed KMS or application encryption key.
4. Backend stores the encrypted secret in a credentials table.
5. Agent routes resolve the workspace credential server-side.
6. Browser never receives the plaintext key again.

LocalStorage is not acceptable for production API keys.
