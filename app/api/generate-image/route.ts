import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { prompt } = (await request.json()) as { prompt?: string };
  const apiKey = process.env.OPENAI_API_KEY;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Generate or write an image prompt first." }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      notice: "Image generation is not configured yet. Add OPENAI_API_KEY to generate images directly."
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
        prompt,
        size: "1024x1024"
      })
    });

    if (!response.ok) {
      return NextResponse.json({
        configured: false,
        notice: `Image generation could not be reached (${response.status}). You can still copy the prompt.`
      });
    }

    const data = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const firstImage = data.data?.[0];

    return NextResponse.json({
      configured: true,
      imageUrl: firstImage?.url ?? (firstImage?.b64_json ? `data:image/png;base64,${firstImage.b64_json}` : ""),
      notice: firstImage ? undefined : "Image generation finished without an image. You can still copy the prompt."
    });
  } catch {
    return NextResponse.json({
      configured: false,
      notice: "Image generation failed quietly. You can still copy the prompt."
    });
  }
}
