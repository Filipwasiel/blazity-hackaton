# Stack

Decided constraints, plus the choices still open. See [[architecture]] for how
these fit together.

## Decided

- **Shape** — local-only web app. No backend service, no auth, no database.
  History persists in the browser via localStorage.
- **Framework** — Next.js (App Router) with TypeScript and React. Plain CSS
  (no Tailwind) to keep the dependency surface small. The single Claude call
  lives in a server route handler (`app/api/generate/route.ts`,
  `runtime = "nodejs"`), which keeps the API key off the browser without a
  separate backend service.
- **Run commands** — `npm install`, then `npm run dev` (localhost:3000).
  `npm run build` compiles and type-checks; `npm start` serves the build. The
  key is supplied via `.env.local` (`ANTHROPIC_API_KEY`); copy `.env.example`.
- **AI provider** — Anthropic Claude, via the official SDK
  (`@anthropic-ai/sdk` for JS/TS, `anthropic` for Python). Default model
  `claude-sonnet-4-6` ($3 / $15 per MTok — strong instruction following for
  tone-controlled, multi-format text). `claude-opus-4-8` ($5 / $25) is the
  higher-quality option for the same surface. Do not hardcode date suffixes on
  these IDs.
- **Claude API conventions** — adaptive thinking only
  (`thinking: {type: "adaptive"}`); `budget_tokens` and `temperature` /
  `top_p` / `top_k` are rejected on these models. Use `output_config.format`
  for structured JSON output (not assistant prefill, which 400s). Keep the API
  key server-side. The `claude-api` skill is the authoritative reference before
  writing any Anthropic SDK code.

## Known tooling

- Git for version control.
- Atlas (`@blazity-atlas/core`) manages the AI workspace; run it via
  `npx --yes @blazity-atlas/core@latest doctor`.

## Unknowns

- No automated tests yet — add a test command here when one is introduced.
