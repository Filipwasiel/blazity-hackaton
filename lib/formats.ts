import { FormatKey } from "./types";

export interface FormatMeta {
  key: FormatKey;
  label: string;
  hint: string;
}

// Display metadata for the six format cards, in render order.
export const FORMAT_META: FormatMeta[] = [
  { key: "tweet", label: "Tweet", hint: "Under 280 characters, with a hook" },
  {
    key: "linkedin",
    label: "LinkedIn post",
    hint: "3–5 short paragraphs, ends with a question",
  },
  { key: "newsletter", label: "Newsletter intro", hint: "Warm, 100–150 words" },
  {
    key: "articleOutline",
    label: "Article outline",
    hint: "Title + 4–6 sections",
  },
  {
    key: "videoScript",
    label: "Short video script",
    hint: "Hook / body / CTA for Reels, Shorts, TikTok",
  },
  {
    key: "imagePrompt",
    label: "Image prompt",
    hint: "For Midjourney or DALL·E",
  },
];
