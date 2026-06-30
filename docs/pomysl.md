### TOPIC

One Idea, Every Format

Takes a single content idea and expands it into a tweet, a post, a newsletter, an article, a video script, and an image prompt - each tailored to its platform.


### FEATURES

**1. Idea Input**
Single text field — user types one raw idea (a sentence or short paragraph). No accounts, no onboarding. Just paste and go.

**2. Multi-Format Generation**
One click expands the idea into six ready-to-use formats:
- **Tweet** — punchy, under 280 chars, with a hook
- **LinkedIn post** — professional tone, 3–5 short paragraphs, ends with a question
- **Newsletter intro** — warm, personal, 100–150 words to open a send
- **Article outline** — H1 + 4–6 H2 sections with one-line descriptions each
- **Short video script** — hook (5s), body (30–45s), CTA (5s); works for Reels/Shorts/TikTok
- **Image prompt** — descriptive prompt ready to paste into Midjourney or DALL-E

**3. Inline Editing**
Each generated block is editable in place before copying. No switching to another tool to tweak.

**4. One-Click Copy**
Copy button per format. Copies clean text, no markdown artifacts.

**5. Tone Selector**
Before generating, pick a tone: Professional / Casual / Bold. Applies consistently across all formats.

**6. History**
Last 10 ideas saved to localStorage. Click any to reload and regenerate or copy old outputs. No backend needed.

**7. Reuse Previous Project (Brand Memory)** — _NEW_
A "Reuse from previous project" control reads a prior entry from history and **applies its config and assets to the new generation**, so everything stays on-brand:
- **Config reused:** the selected tone (Professional / Casual / Bold) plus an optional saved **brand voice** (a short free-text brand description) and audience.
- **Assets reused:** brand color(s) and an optional reference-image description that gets injected into the **image prompt** so visuals stay consistent across pieces.
- **How it works:** when the user picks a previous project, its `config` + `brandKit` are loaded from localStorage and passed into the generation request as additional context. One click = a fresh idea expanded with the *same* brand rules as last time. No backend, no accounts.

This directly targets the hackathon's "off-brand checking / keep tone consistent" pain: instead of re-picking tone and re-describing the brand every time, the app remembers the last project and reuses it.

---

## Proposed Tech & Stack

The app is a single-page web app with one AI call per generation and no real database (history + brand kit live in `localStorage`). Recommended stack:

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | One project for UI + the AI endpoint; React Server Components keep the bundle small. |
| Bootstrap | **Blazity `next-enterprise` boilerplate** | This is a Blazity hackathon — starting from Blazity's own enterprise template means we **inherit its config and assets** (Tailwind config, design tokens, ESLint/Prettier, CI). This is the dev-side answer to "use the same config/assets from a previous project." |
| Styling/UI | **Tailwind CSS + shadcn/ui** | Fast to build the six editable format cards, tone selector, and copy buttons; ships with the boilerplate. |
| AI call | **Anthropic TypeScript SDK** (`@anthropic-ai/sdk`) in a Next.js **Route Handler** (`app/api/generate/route.ts`) | Keeps the API key server-side; the browser never sees it. |
| Output shape | **Structured Outputs** (`output_config.format` with a JSON schema) | One request returns all six formats as typed JSON — no fragile string parsing. |
| State | **React state + `localStorage`** | History (last 10) and the Brand Kit. No DB needed for the hackathon. |
| Deploy | **Vercel** | Native Next.js host; set `ANTHROPIC_API_KEY` as an env var. |

### Recommended AI model & approach

**Model: `claude-opus-4-8`** (Claude Opus 4.8) — the default, highest-quality choice; on-brand copy and a clean image prompt benefit from the strongest model. The whole job is **one structured-output call**:

- Build a JSON schema with six fields (`tweet`, `linkedin`, `newsletter`, `articleOutline`, `videoScript`, `imagePrompt`) and call `client.messages.parse(...)` (or `messages.create` with `output_config.format`) — all six formats come back validated in a single response.
- Pass **tone** + the reused **brand voice / color / reference-image** (Feature 7) in the system prompt or user message so every format obeys the same brand rules.
- For this latency-sensitive UX, set `output_config: {effort: "low"}` and keep adaptive thinking on (with thinking off, Opus 4.8 may pad the visible answer). **Stream** the response so the cards fill in progressively.

**Pricing (per 1M tokens):** Opus 4.8 = **$5 in / $25 out**. A generation is ~1–2K input + ~2–3K output → **≈ $0.07 per generation**. If the team wants to drive cost down for a high-volume demo, two explicit levers (a deliberate model swap, not a silent downgrade):

| Model | $/1M in | $/1M out | ~Cost / generation | When |
|---|---|---|---|---|
| `claude-opus-4-8` | $5 | $25 | ~$0.07 | Best quality (recommended default) |
| `claude-sonnet-4-6` | $3 | $15 | ~$0.04 | Balanced speed/quality |
| `claude-haiku-4-5` | $1 | $5 | ~$0.014 | Cheapest + fastest for a live demo |

Make the model a single env/config constant so it can be switched in one place.

---

## Work Division (3 people)

**Person A — Frontend / UI & Brand styling**
- Scaffold the app from Blazity `next-enterprise`; wire Tailwind + shadcn/ui and pull in the boilerplate's design tokens/assets.
- Build: idea input, tone selector, the six editable format cards (inline edit + per-card copy), responsive layout, loading/skeleton states.
- Owns visual consistency so reused brand colors actually render.

**Person B — AI / Backend**
- `app/api/generate/route.ts`: Anthropic SDK call, the six-field structured-output **JSON schema**, prompt design per format, tone handling, streaming.
- Inject the reused brand context (voice/color/reference image) into the prompt.
- Model config constant + env var; error handling and basic rate-limit/timeout guards.

**Person C — State, History & Reuse-Previous-Project (Feature 7)**
- `localStorage` history (last 10) + the **Brand Kit** data model (`config` + `brandKit`).
- The **"Reuse from previous project"** flow: load a prior entry, hydrate tone/brand-voice/color/reference-image, and feed them into Person B's request.
- Glue (history reload/regenerate, copy-all), and Vercel deployment + env setup.

**Shared first step:** agree the `Project`/`BrandKit` TypeScript types up front (Person B's schema ↔ Person C's localStorage shape ↔ Person A's props) so the three streams integrate cleanly.


### agents imitating team
Content generation should be divided into seperate agents each agent is responsible for their own task, lead will check the content and format it to the final output.
1. Agent Copywriter (Wydania Długie/Profesjonalne)
Obsługiwane formaty: LinkedIn Post, Newsletter Intro, Article Outline.
Cel: Budowanie angażującej, merytorycznej treści, dbanie o logiczną strukturę konspektu i przyjazne rozpoczęcie newslettera.
2. Agent Social Media Manager (Wydania Krótkie/Dynamiczne)
Obsługiwane formaty: Tweet, Short Video Script (Reels/TikTok).
Cel: Chwytliwe haki (hooks), dynamiczny język, zmieszczenie się w limitach znaków, zachowanie struktury scenopisu (Hook, Body, CTA).
3. Agent Art Director (Wizualny Prompt Engineer)
Obsługiwane formaty: Image Prompt.
Cel: Przekształcenie idei i kolorów marki w profesjonalny, szczegółowy prompt malarski/fotograficzny dla Midjourney/DALL-E, z zachowaniem stylu i kompozycji.
4. Lead Agent: Editor-in-Chief (Edytor Naczelny / QA)
Rola: Łącznik i instancja weryfikacyjna.
Cel: Pobiera teksty od 3 specjalistów, porównuje z oryginalnym pomysłem, wybranym tonem (Professional/Casual/Bold) oraz Brand Kit (voice, audience, colors) i ujednolica styl, aby nie było czuć, że pisały to różne "osoby". Na koniec formatuje dane do finalnego schematu JSON.
Optimise this process, use less ccostly agents for easier tasks, only lead should be higher paid mode.
