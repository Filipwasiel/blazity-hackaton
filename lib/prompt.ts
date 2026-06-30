import { Tone } from "./types";

// JSON Schema for structured output. Keys match Formats (lib/types.ts).
// additionalProperties:false + every key required is mandated by the
// structured-outputs API.
export const GENERATION_SCHEMA = {
  type: "object",
  properties: {
    tweet: { type: "string" },
    linkedin: { type: "string" },
    newsletter: { type: "string" },
    articleOutline: { type: "string" },
    videoScript: { type: "string" },
    imagePrompt: { type: "string" },
  },
  required: [
    "tweet",
    "linkedin",
    "newsletter",
    "articleOutline",
    "videoScript",
    "imagePrompt",
  ],
  additionalProperties: false,
} as const;

export function buildSystemPrompt(tone: Tone): string {
  return `You expand a single content idea into six platform-tailored pieces. The user's message is the raw idea. Write everything in a ${tone} tone, and keep the same core message across all six pieces.

Return one piece per output field:

- tweet: a single tweet under 280 characters with a strong hook. Plain text. Only use hashtags if they genuinely add value.
- linkedin: a LinkedIn post, 3–5 short paragraphs separated by blank lines, ending with one open question. Plain text, no markdown symbols.
- newsletter: a warm newsletter opening of 100–150 words that draws the reader in and sets up the rest of the send. Plain text.
- articleOutline: an article outline as plain text — one title line prefixed "Title: ", then 4–6 section lines each prefixed "Section: " and followed by a one-sentence description on the same line. No markdown symbols like # or *.
- videoScript: a short-form video script for Reels/Shorts/TikTok with three labeled beats, each on its own line(s): "Hook (5s): ...", "Body (30–45s): ...", "CTA (5s): ...". Plain text.
- imagePrompt: a single descriptive image-generation prompt (for Midjourney or DALL·E) capturing the idea's subject, mood, style, and composition. One paragraph, plain text.

Each piece must be self-contained and ready to copy. Do not add commentary, headings, or labels outside the fields.`;
}
