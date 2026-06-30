# Architecture

A single-page web app that runs locally, with no backend service, no auth, and
no database. State and history live in the browser via localStorage. See
[[product]] for what it does and [[stack]] for the technology decisions still
open.

## Shape

- **Input** — one text field for the raw idea, plus a tone selector
  (Professional / Casual / Bold).
- **Generation** — one action turns the idea into six platform outputs. A
  single Claude call returns all six formats; structured output
  (`output_config.format`) keeps each format in its own field so the UI can
  render them into separate, individually-editable cards.
- **Output** — six editable cards (tweet, LinkedIn post, newsletter intro,
  article outline, short video script, image prompt), each with inline editing
  and a one-click clean-text copy button.
- **History** — last 10 ideas persisted to localStorage; selecting one reloads
  it to regenerate or copy prior outputs.

## API key boundary

The Anthropic API key must never reach the browser. Even though the app is
"local-only", the Claude call belongs behind a minimal server-side boundary
(e.g. a framework route handler / dev-server endpoint) that reads the key from
the environment. The chosen framework should support this without standing up a
separate backend service.

## Current layout

- `app/page.tsx` — client UI: idea input, tone selector, generate, six cards,
  history list.
- `app/api/generate/route.ts` — server route (`runtime = "nodejs"`). Reads
  `ANTHROPIC_API_KEY` from the environment, calls Claude with the system prompt
  and JSON schema, returns `{ formats }`. Validates input and handles the
  no-key / refusal / failure paths with friendly messages.
- `components/FormatCard.tsx` — one editable card with a copy button.
- `lib/` — `types.ts` (Tone, FormatKey, Formats, HistoryItem),
  `formats.ts` (card labels/hints), `prompt.ts` (system prompt + GENERATION_SCHEMA),
  `history.ts` (localStorage, capped at 10).
- `docs/` — product brief (`docs/pomysl.md`).
- `.ai/` — Atlas AI workspace; `.ai/config.json` is the source of truth for
  artifact locations.
- `AGENTS.md` / `CLAUDE.md` — agent instructions (`CLAUDE.md` imports `AGENTS.md`).
- `.agents/`, `.claude/`, `.cursor/` — generated agent surfaces (their `skills`
  entries are NTFS junctions to `.ai/skills` on this Windows checkout).

## Generation contract — agent team

Generation is a multi-agent pipeline (`lib/agents.ts`, `runTeam`), modeled as a
content team with a lead reviewer. Cost is tiered: specialists run on cheap
models, only the lead runs on the strong model.

1. Three **specialist agents run in parallel** (`Promise.all`), each with its own
   sub-schema (`output_config.format`):
   - **Copywriter** (`claude-sonnet-4-6`) → linkedin, newsletter, articleOutline
   - **Social Media Manager** (`claude-haiku-4-5`) → tweet, videoScript
   - **Art Director** (`claude-haiku-4-5`) → imagePrompt
2. The **Editor-in-Chief / lead** (`claude-opus-4-8`, `effort: "low"`) receives
   the assembled drafts plus the idea, tone, and brand context. It verifies
   against the idea, unifies the voice, enforces constraints (tweet < 280, etc.),
   and returns the final six-field JSON (`GENERATION_SCHEMA`, `lib/prompt.ts`).

Each model is a config constant overridable via env (`MODEL_COPYWRITER`,
`MODEL_SOCIAL`, `MODEL_ART`, `MODEL_LEAD`). Tone and the optional `brandKit`
(voice / audience / colors / reference image — Feature 7) are injected into the
prompts, not the schema. Haiku rejects `effort`, so it is set only on the lead.
