import { NextRequest, NextResponse } from "next/server";
import { FormatKey } from "@/lib/types";

export const runtime = "nodejs";

function buildImagePrompt(format: FormatKey, content: string, idea: string): string {
  if (format === "imagePrompt") return content;
  const short = idea.length > 80 ? idea.slice(0, 80) + "…" : idea;
  const context: Record<Exclude<FormatKey, "imagePrompt">, string> = {
    tweet: `Bold eye-catching social media visual, vibrant colors, minimal text, for: "${short}". Professional photography, square format.`,
    linkedin: `Professional business photography, clean corporate setting, editorial quality, for LinkedIn post about: "${short}".`,
    newsletter: `Warm editorial newsletter header image, inviting clean layout, magazine quality, for: "${short}".`,
    articleOutline: `Editorial blog cover photo, thoughtful composition, modern and clean, for article about: "${short}".`,
    videoScript: `Cinematic video thumbnail, dramatic lighting, high contrast, broadcast quality, for video about: "${short}".`,
  };
  return context[format as Exclude<FormatKey, "imagePrompt">];
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = body as { format?: unknown; content?: unknown; idea?: unknown };
  const format = raw.format as FormatKey;
  const content = typeof raw.content === "string" ? raw.content : "";
  const idea = typeof raw.idea === "string" ? raw.idea : "";

  const prompt = buildImagePrompt(format, content, idea);

  try {
    // Używamy darmowego API Pollinations, które nie wymaga klucza
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

    // Zwracamy po prostu skonstruowany URL (Pollinations wygeneruje obraz w locie, gdy przeglądarka spróbuje go pobrać)
    return NextResponse.json({ imageUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Image generation failed.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
