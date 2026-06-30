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

  if (!process.env.FAL_KEY) {
    return NextResponse.json(
      { error: "FAL_KEY is not set. Add it to .env.local — see .env.example." },
      { status: 500 },
    );
  }

  const prompt = buildImagePrompt(format, content, idea);

  try {
    const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`fal.ai error: ${err}`);
    }

    const data = (await res.json()) as {
      images: Array<{ url: string; content_type: string }>;
    };
    const url = data.images?.[0]?.url;
    if (!url) throw new Error("No image returned from fal.ai.");

    return NextResponse.json({ imageUrl: url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Image generation failed.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
