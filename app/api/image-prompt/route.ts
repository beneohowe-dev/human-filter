import { NextResponse } from "next/server";
import { buildImagePrompt } from "@/lib/human-filter-engine";
import type { ImagePromptRequest } from "@/lib/human-filter-data";

export async function POST(request: Request) {
  const payload = (await request.json()) as ImagePromptRequest;

  return NextResponse.json({
    configured: true,
    prompt: buildImagePrompt(payload)
  });
}
