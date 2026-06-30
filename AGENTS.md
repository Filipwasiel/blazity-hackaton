
# Project AI Instructions

## What this repo is

`blazity-hackaton` — a hackathon project for Blazity's "AI for Content"
challenge. The product is **"One Idea, Every Format"**: a locally-run web app
that takes a single content idea and expands it into six platform-tailored
outputs (tweet, LinkedIn post, newsletter intro, article outline, short video
script, image prompt), with a tone selector, inline editing, one-click copy,
and localStorage history. See `docs/pomysl.md` for the topic and feature list,
and `.ai/memory/` for stable product/architecture/stack context.

Scope is deliberately small and solid: the critical path is
input → generate all six → copy. No backend, no auth, no database.

## Structure

- `app/` — Next.js App Router. `app/page.tsx` is the UI; `app/api/generate/`
  `route.ts` is the server route that calls Claude. `app/globals.css` is the
  styling.
- `components/` — React components (e.g. `FormatCard.tsx`).
- `lib/` — non-UI logic: `types.ts`, `formats.ts`, `prompt.ts` (system prompt +
  JSON schema), `history.ts` (localStorage).
- `docs/` — product brief. `docs/pomysl.md` holds the topic and feature spec.
- `.ai/` — Atlas AI workspace. `.ai/config.json` is the source of truth for
  artifact locations (memory, vocabulary, plans, research, decisions, results).
- `AGENTS.md` / `CLAUDE.md` — agent instructions; `CLAUDE.md` imports this file.
- `.agents/`, `.claude/`, `.cursor/` — generated agent surfaces.

## Working rules

- Stack: Next.js (App Router) + TypeScript + React, plain CSS, no backend.
  Run with `npm run dev` (localhost:3000); `npm run build` type-checks. The
  Claude call must stay in `app/api/generate/route.ts` (server, `runtime =
  "nodejs"`) so the API key never reaches the browser. Set the key in
  `.env.local` (`ANTHROPIC_API_KEY`); see `.env.example`. Keep details in sync
  with `.ai/memory/stack.md`.
- AI provider is **Anthropic Claude**. Default model `claude-sonnet-4-6`
  (`claude-opus-4-8` for higher quality). Use the official SDK; keep the API
  key server-side, never in the browser. Adaptive thinking only
  (`thinking: {type: "adaptive"}`) — `budget_tokens` is rejected. Use
  `output_config.format` for structured JSON, not assistant prefill. When
  touching Claude/Anthropic code, the `claude-api` skill is the source of truth.
- There are no project-specific safe commands yet beyond Atlas tooling:
  `npx --yes @blazity-atlas/core@latest doctor` checks workspace health.
- Do not edit the `<!-- BEGIN/END ATLAS -->` managed block below by hand.
- Keep durable docs depersonalized (see Atlas Documentation Rules below).
- Windows note: the `.claude`/`.agents`/`.cursor` `skills` entries are NTFS
  junctions to `.ai/skills` (Atlas wants relative symlinks, which need admin /
  Developer Mode here). `doctor` reports `wrong-skill-link-target` for them —
  expected and harmless; the junctions resolve correctly. They are held with
  `git update-index --skip-worktree` so the junction churn stays out of git.

<!-- BEGIN ATLAS: artifact-paths -->
## Atlas Artifact Paths

`.ai/config.json` is the source of truth for AI artifact locations in this repository.
Before writing plans, research, decisions, ADRs, results, memory, vocabulary, or skill outputs, resolve the destination through `artifactRoot`, `paths`, and `pathAliases`.
If an imported skill, template, or instruction mentions a different path, map it through `.ai/config.json` before reading or writing files.
Do not create new documentation roots unless `.ai/config.json` explicitly allows them.

## Atlas Documentation Rules

Durable documentation records needs, decisions, and reasons — never individuals or internal process.
Write "memory was needed to persist context across runs", not "<name> wanted memory".
Keep personal names, private schedules, internal-only references, and absolute local paths out of workspace artifacts.
<!-- END ATLAS: artifact-paths -->
