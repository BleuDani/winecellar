import { NextRequest } from "next/server";
import { streamText, tool, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { lookupVivino } from "@/lib/apify";
import { saveVivinoData } from "@/actions/wine.actions";

export const maxDuration = 120;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const wine = await prisma.wine.findUnique({
    where: { id },
    include: { vivinoData: true },
  });
  if (!wine) {
    return new Response("Wine not found", { status: 404 });
  }

  if (!process.env.APIFY_API_KEY) {
    return new Response("APIFY_API_KEY not configured", { status: 503 });
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    stopWhen: stepCountIs(6),
    system: `You are a wine data enrichment agent. Your job is to fetch data about a wine from Vivino and save it.
Follow these steps in order:
1. Call lookupVivino with the wine's existing Vivino URL if set, otherwise a search query of producer + name + vintage.
2. Call saveEnrichmentData to persist the results.
3. Report a brief summary of what was saved (score, review count, style, food pairings found).
Be concise and factual. Do not ask questions.`,
    prompt: `Enrich this wine:
Producer: ${wine.producer}
Name: ${wine.name}
Vintage: ${wine.vintage ?? "unknown"}
Current Vivino URL: ${wine.vivinoUrl ?? "not set"}`,
    tools: {
      lookupVivino: tool({
        description: "Search Vivino (or fetch a known Vivino URL) for score, reviews, style, food pairings, and description.",
        inputSchema: z.object({
          query: z.string().describe("A Vivino URL if known, otherwise a search query like 'Opus One 2019 Napa'"),
        }),
        execute: async ({ query }) => {
          const data = await lookupVivino(query);
          if (data.vivinoUrl) {
            await prisma.wine.update({ where: { id }, data: { vivinoUrl: data.vivinoUrl } });
          }
          return data;
        },
      }),
      saveEnrichmentData: tool({
        description: "Save the Vivino enrichment data to the database.",
        inputSchema: z.object({
          score: z.number().nullable(),
          reviewCount: z.number().nullable(),
          wineStyle: z.string().nullable(),
          foodPairings: z.array(z.string()),
          description: z.string().nullable(),
          vivinoUrl: z.string().nullable().describe("Pass if a URL was found that should be saved"),
        }),
        execute: async ({ score, reviewCount, wineStyle, foodPairings, description, vivinoUrl }) => {
          const { error } = await saveVivinoData(id, {
            score,
            reviewCount,
            wineStyle,
            foodPairings,
            description,
            vivinoUrl,
          });
          return { saved: !error };
        },
      }),
    },
  });

  return result.toTextStreamResponse();
}
