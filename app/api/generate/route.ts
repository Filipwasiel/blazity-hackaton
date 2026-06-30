import { NextRequest, NextResponse } from "next/server";
import { runTeam } from "@/lib/agents";
import { BrandKit, isTone, Tone } from "@/lib/types";

// The Anthropic SDK needs the Node.js runtime (not Edge).
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = body as { idea?: unknown; tone?: unknown; brandKit?: BrandKit };
  const idea = typeof raw.idea === "string" ? raw.idea.trim() : "";
  const tone: Tone = isTone(raw.tone) ? raw.tone : "Professional";
  const brandKit =
    raw.brandKit && typeof raw.brandKit === "object" ? raw.brandKit : undefined;

  if (!idea) {
    return NextResponse.json({ error: "Please enter an idea." }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set. Copy .env.example to .env.local and add your key.",
      },
      { status: 500 },
    );
  }

  try {
    // Three specialist agents run in parallel; the lead reviews and finalizes.
    const formats = await runTeam(idea, tone, brandKit);
    return NextResponse.json({ formats });
  } catch (err) {
    const messageText =
      err instanceof Error ? err.message : "Generation failed. Please try again.";
    return NextResponse.json({ error: messageText }, { status: 502 });
  }
}
