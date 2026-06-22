import { NextResponse } from "next/server";
import { buildAgentPrompt, localRewrite } from "@/lib/human-filter-engine";
import type { RewriteRequest, RewriteResponse } from "@/lib/human-filter-data";

export const runtime = "nodejs";

function extractTextFromResponse(data: unknown) {
  if (!data || typeof data !== "object") return "";
  const record = data as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };

  if (typeof record.output_text === "string") {
    return record.output_text;
  }

  return (
    record.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .join("\n")
      .trim() ?? ""
  );
}

function parseJsonResponse(text: string) {
  const trimmed = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(trimmed) as Omit<RewriteResponse, "configured" | "notice">;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as RewriteRequest;
  const local = localRewrite(payload);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!payload.input?.trim()) {
    return NextResponse.json({ error: "Add some text to filter first." }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json(local);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TEXT_MODEL ?? "gpt-4.1-mini",
        input: buildAgentPrompt(payload),
        temperature: 0.45
      })
    });

    if (!response.ok) {
      return NextResponse.json({
        ...local,
        notice: `Text generation could not be reached (${response.status}). Showing a local preview for now.`
      });
    }

    const data = await response.json();
    const generated = parseJsonResponse(extractTextFromResponse(data));

    return NextResponse.json({
      ...generated,
      configured: true
    });
  } catch {
    return NextResponse.json({
      ...local,
      notice: "Text generation failed quietly. Showing a local preview for now."
    });
  }
}
