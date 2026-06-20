import { NextRequest } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const maxDuration = 30;

const ExtractedWineSchema = z.object({
  producer: z.string().nullable(),
  name: z.string().nullable(),
  vintage: z.number().nullable(),
  region: z.string().nullable(),
  country: z.string().nullable(),
  grapeGuesses: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    return Response.json({ error: "No image provided" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-6"),
      schema: ExtractedWineSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image: bytes, mediaType: file.type || "image/jpeg" },
            {
              type: "text",
              text: "Read this wine label photo and identify the wine. Extract the producer/winery name, the specific wine name or cuvée, the vintage year, the region, and the country of origin. Also guess likely grape varieties if you can tell from the label. Use null for anything you can't determine — do not guess wildly.",
            },
          ],
        },
      ],
    });
    return Response.json(object);
  } catch {
    return Response.json({ error: "Couldn't read the label" }, { status: 500 });
  }
}
