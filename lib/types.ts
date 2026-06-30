export const TONES = ["Professional", "Casual", "Bold"] as const;
export type Tone = (typeof TONES)[number];

// Keys are the canonical "six formats". Order here is the display order.
export const FORMAT_KEYS = [
  "tweet",
  "linkedin",
  "newsletter",
  "articleOutline",
  "videoScript",
  "imagePrompt",
] as const;
export type FormatKey = (typeof FORMAT_KEYS)[number];

export type Formats = Record<FormatKey, string>;

// Optional brand context reused across generations (Feature 7 / Brand Memory).
export interface BrandKit {
  voice?: string;
  audience?: string;
  colors?: string[];
  referenceImage?: string;
}

export interface BrandKit {
  brandVoice?: string;
  audience?: string;
  colors?: string[];
  referenceImage?: string;
}

export interface HistoryItem {
  id: string;
  idea: string;
  tone: Tone;
  brandKit?: BrandKit;
  formats: Formats;
  createdAt: number;
}

export function isTone(value: unknown): value is Tone {
  return typeof value === "string" && (TONES as readonly string[]).includes(value);
}

export function hasBrandContent(kit: BrandKit): boolean {
  return !!(
    kit.brandVoice?.trim() ||
    kit.audience?.trim() ||
    (kit.colors && kit.colors.length > 0) ||
    kit.referenceImage?.trim()
  );
}
