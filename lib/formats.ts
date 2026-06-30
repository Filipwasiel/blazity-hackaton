import { FormatKey } from "./types";

export interface FormatMeta {
  key: FormatKey;
  label: string;
  hint: string;
  icon: string;
  color: string;
}

// Display metadata for the six format cards, in render order.
export const FORMAT_META: FormatMeta[] = [
  {
    key: "tweet",
    label: "Tweet",
    hint: "Under 280 characters, with a hook",
    icon: "✦",
    color: "#1d9bf0",
  },
  {
    key: "linkedin",
    label: "LinkedIn post",
    hint: "3–5 short paragraphs, ends with a question",
    icon: "◆",
    color: "#0a66c2",
  },
  {
    key: "newsletter",
    label: "Newsletter intro",
    hint: "Warm, 100–150 words",
    icon: "✉",
    color: "#f59e0b",
  },
  {
    key: "articleOutline",
    label: "Article outline",
    hint: "Title + 4–6 sections",
    icon: "≡",
    color: "#10b981",
  },
  {
    key: "videoScript",
    label: "Short video script",
    hint: "Hook / body / CTA for Reels, Shorts, TikTok",
    icon: "▶",
    color: "#f43f5e",
  },
  {
    key: "imagePrompt",
    label: "Image prompt",
    hint: "For Midjourney or DALL·E",
    icon: "✿",
    color: "#a78bfa",
  },
];
