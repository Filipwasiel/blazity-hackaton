import Anthropic from "@anthropic-ai/sdk";
import { AgentInstructions, BrandKit, Formats, Tone } from "./types";
import { GENERATION_SCHEMA } from "./prompt";

// One client per server process; reads ANTHROPIC_API_KEY from the environment.
const client = new Anthropic();

// Model per role, overridable via env. Cost tiering: specialists run on cheap
// models, only the lead (Editor-in-Chief) runs on the strong, higher-cost model.
export const MODELS = {
  // Longer / professional copy — mid-tier.
  copywriter: process.env.MODEL_COPYWRITER ?? "claude-sonnet-4-6",
  // Short, punchy social — cheapest/fastest.
  social: process.env.MODEL_SOCIAL ?? "claude-haiku-4-5",
  // Single image prompt — cheapest/fastest.
  art: process.env.MODEL_ART ?? "claude-haiku-4-5",
  // Review, unify voice, format final JSON — strongest model.
  lead: process.env.MODEL_LEAD ?? "claude-opus-4-8",
} as const;

type Effort = "low" | "medium" | "high" | "max";

// Sub-schemas per specialist (each owns only its formats).
const COPYWRITER_SCHEMA = {
  type: "object",
  properties: {
    linkedin: { type: "string" },
    newsletter: { type: "string" },
    articleOutline: { type: "string" },
  },
  required: ["linkedin", "newsletter", "articleOutline"],
  additionalProperties: false,
} as const;

const SOCIAL_SCHEMA = {
  type: "object",
  properties: {
    tweet: { type: "string" },
    videoScript: { type: "string" },
  },
  required: ["tweet", "videoScript"],
  additionalProperties: false,
} as const;

const ART_SCHEMA = {
  type: "object",
  properties: { imagePrompt: { type: "string" } },
  required: ["imagePrompt"],
  additionalProperties: false,
} as const;

function withInstructions(system: string, extra?: string): string {
  if (!extra?.trim()) return system;
  return `${system}\n\nAdditional instructions:\n${extra.trim()}`;
}

function brandContext(tone: Tone, brand?: BrandKit): string {
  const lines = [`Tone: ${tone}.`];
  if (brand?.voice) lines.push(`Brand voice: ${brand.voice}`);
  if (brand?.audience) lines.push(`Audience: ${brand.audience}`);
  if (brand?.colors?.length) lines.push(`Brand colors: ${brand.colors.join(", ")}`);
  if (brand?.referenceImage) lines.push(`Reference image style: ${brand.referenceImage}`);
  return lines.join("\n");
}

async function runAgent<T>(params: {
  model: string;
  system: string;
  user: string;
  schema: object;
  maxTokens?: number;
  effort?: Effort;
}): Promise<T> {
  const message = await client.messages.create({
    model: params.model,
    max_tokens: params.maxTokens ?? 2000,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
    output_config: {
      format: {
        type: "json_schema",
        schema: params.schema as Record<string, unknown>,
      },
      // Effort is only set for models that support it (the lead). Haiku rejects it.
      ...(params.effort ? { effort: params.effort } : {}),
    },
  });

  if (message.stop_reason === "refusal") {
    throw new Error("The request was declined. Try rephrasing your idea.");
  }
  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error(`${params.model} returned no usable content.`);
  }
  return JSON.parse(block.text) as T;
}

// 1. Copywriter — long / professional editions.
function runCopywriter(idea: string, ctx: string, extra?: string) {
  return runAgent<Pick<Formats, "linkedin" | "newsletter" | "articleOutline">>({
    model: MODELS.copywriter,
    maxTokens: 2200,
    schema: COPYWRITER_SCHEMA,
    system: withInstructions(
      `You are a senior copywriter on a content team, handling the longer, professional pieces. Write engaging, substantive copy with logical structure. Match this brand context exactly:
${ctx}

Produce three fields:
- linkedin: a LinkedIn post, 3–5 short paragraphs separated by blank lines, ending with one open question. Plain text, no markdown symbols.
- newsletter: a warm newsletter opening of 100–150 words that draws the reader in and sets up the send. Plain text.
- articleOutline: an outline as plain text — one line prefixed "Title: ", then 4–6 lines each prefixed "Section: " followed by a one-sentence description on the same line. No markdown symbols (#, *).`,
      extra,
    ),
    user: `Idea:\n${idea}`,
  });
}

// 2. Social Media Manager — short / dynamic editions.
function runSocial(idea: string, ctx: string, extra?: string) {
  return runAgent<Pick<Formats, "tweet" | "videoScript">>({
    model: MODELS.social,
    maxTokens: 1200,
    schema: SOCIAL_SCHEMA,
    system: withInstructions(
      `You are a social media manager handling short, dynamic content. Lead with strong hooks, keep language punchy, and respect character limits and script structure. Match this brand context exactly:
${ctx}

Produce two fields:
- tweet: a single tweet under 280 characters with a strong hook. Plain text. Hashtags only if they add value.
- videoScript: a short-form script (Reels/Shorts/TikTok) with three labeled beats, each on its own line(s): "Hook (5s): ...", "Body (30–45s): ...", "CTA (5s): ...". Plain text.`,
      extra,
    ),
    user: `Idea:\n${idea}`,
  });
}

// 3. Art Director — visual prompt engineer.
function runArtDirector(idea: string, ctx: string, extra?: string) {
  return runAgent<Pick<Formats, "imagePrompt">>({
    model: MODELS.art,
    maxTokens: 800,
    schema: ART_SCHEMA,
    system: withInstructions(
      `You are an art director and prompt engineer. Turn the idea and any brand colors/reference style into one professional, detailed image-generation prompt for Midjourney or DALL·E, with clear subject, mood, style, lighting, and composition. Match this brand context exactly:
${ctx}

Produce one field:
- imagePrompt: a single descriptive paragraph, plain text. If brand colors are given, weave them in.`,
      extra,
    ),
    user: `Idea:\n${idea}`,
  });
}

// 4. Editor-in-Chief (Lead) — verify, unify voice, format final JSON.
function runEditorInChief(idea: string, ctx: string, drafts: Formats, extra?: string) {
  return runAgent<Formats>({
    model: MODELS.lead,
    maxTokens: 4000,
    schema: GENERATION_SCHEMA,
    effort: "low",
    system: withInstructions(
      `You are the Editor-in-Chief of a content team. Three specialists drafted the pieces below. Your job:
- Verify every piece against the original idea and the brand context.
- Unify the voice so all six read as one author — fix tonal drift, repetition, and any "written by different people" feel.
- Enforce constraints: tweet under 280 characters; LinkedIn ends with a question; newsletter 100–150 words; outline has Title + 4–6 Sections; video script keeps Hook/Body/CTA; image prompt stays one descriptive paragraph.
- Keep the specialists' good work — polish, don't rewrite from scratch.
Brand context:
${ctx}

Return the final, polished set as the six output fields. Clean plain text, ready to copy.`,
      extra,
    ),
    user: `Original idea:\n${idea}\n\nDraft pieces from the team (JSON):\n${JSON.stringify(drafts, null, 2)}`,
  });
}

// Orchestrate: 3 specialists in parallel, then the lead reviews and finalizes.
export async function runTeam(
  idea: string,
  tone: Tone,
  brand?: BrandKit,
  agentInstructions?: AgentInstructions,
): Promise<Formats> {
  const ctx = brandContext(tone, brand);

  const [copy, social, art] = await Promise.all([
    runCopywriter(idea, ctx, agentInstructions?.copywriter),
    runSocial(idea, ctx, agentInstructions?.social),
    runArtDirector(idea, ctx, agentInstructions?.art),
  ]);

  const drafts: Formats = {
    tweet: social.tweet,
    linkedin: copy.linkedin,
    newsletter: copy.newsletter,
    articleOutline: copy.articleOutline,
    videoScript: social.videoScript,
    imagePrompt: art.imagePrompt,
  };

  return runEditorInChief(idea, ctx, drafts, agentInstructions?.lead);
}
