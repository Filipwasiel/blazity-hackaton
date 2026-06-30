import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GENERATION_SCHEMA, buildSystemPrompt } from "@/lib/prompt";
import { Formats, isTone, Tone } from "@/lib/types";

// The Anthropic SDK needs the Node.js runtime (not Edge).
export const runtime = "nodejs";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = body as { idea?: unknown; tone?: unknown };
  const idea = typeof raw.idea === "string" ? raw.idea.trim() : "";
  const tone: Tone = isTone(raw.tone) ? raw.tone : "Professional";

  if (!idea) {
    return NextResponse.json({ error: "Please enter an idea." }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set. Copy .env.example to .env.local and add your key." },
      { status: 500 },
    );
  }

  const client = new Anthropic();

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: buildSystemPrompt(tone),
      messages: [{ role: "user", content: idea }],
      // Structured output: the first text block is guaranteed valid JSON
      // matching GENERATION_SCHEMA.
      output_config: {
        format: { type: "json_schema", schema: GENERATION_SCHEMA },
      },
    });

    if (message.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "The request was declined. Try rephrasing your idea." },
        { status: 422 },
      );
    }

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in the model response.");
    }

    const formats = JSON.parse(textBlock.text) as Formats;
    return NextResponse.json({ formats });
  } catch (err) {
    const messageText =
      err instanceof Error ? err.message : "Generation failed. Please try again.";
    return NextResponse.json({ error: messageText }, { status: 502 });
  }
}
