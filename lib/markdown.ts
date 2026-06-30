import { BrandKit, FormatKey, HistoryItem, Tone } from "./types";

export const FORMAT_FILE_NAMES: Record<FormatKey, string> = {
  tweet: "tweet.md",
  linkedin: "linkedin.md",
  newsletter: "newsletter.md",
  articleOutline: "article-outline.md",
  videoScript: "video-script.md",
  imagePrompt: "image-prompt.md",
};

const FORMAT_LABELS: Record<FormatKey, { label: string; hint: string }> = {
  tweet: { label: "Tweet", hint: "Under 280 characters, with a hook" },
  linkedin: { label: "LinkedIn post", hint: "3–5 short paragraphs, ends with a question" },
  newsletter: { label: "Newsletter intro", hint: "Warm, 100–150 words" },
  articleOutline: { label: "Article outline", hint: "Title + 4–6 sections" },
  videoScript: { label: "Short video script", hint: "Hook / body / CTA for Reels, Shorts, TikTok" },
  imagePrompt: { label: "Image prompt", hint: "For Midjourney or DALL·E" },
};

export function renderBrandMd(tone: Tone, kit: BrandKit): string {
  const lines = ["# Brand Config", "", `**Tone:** ${tone}`];
  if (kit.brandVoice) lines.push(`**Brand voice:** ${kit.brandVoice}`);
  if (kit.audience) lines.push(`**Audience:** ${kit.audience}`);
  if (kit.colors?.length) lines.push(`**Colors:** ${kit.colors.join(", ")}`);
  if (kit.referenceImage) {
    lines.push("", "**Visual reference:**", kit.referenceImage);
  }
  lines.push("", `_Saved at ${new Date().toISOString()}_`);
  return lines.join("\n");
}

export function renderIdeaMd(item: HistoryItem): string {
  const date = new Date(item.createdAt).toISOString();
  const lines = [`# ${item.idea}`, "", `**Tone:** ${item.tone}`, `**Created:** ${date}`];
  if (item.brandKit) {
    lines.push("", "## Brand snapshot");
    if (item.brandKit.brandVoice) lines.push(`**Voice:** ${item.brandKit.brandVoice}`);
    if (item.brandKit.audience) lines.push(`**Audience:** ${item.brandKit.audience}`);
    if (item.brandKit.colors?.length) lines.push(`**Colors:** ${item.brandKit.colors.join(", ")}`);
    if (item.brandKit.referenceImage) lines.push(`**Visual reference:** ${item.brandKit.referenceImage}`);
  }
  return lines.join("\n");
}

export function renderOutputMd(key: FormatKey, content: string): string {
  const { label, hint } = FORMAT_LABELS[key];
  return `# ${label}\n_${hint}_\n\n${content}\n`;
}
