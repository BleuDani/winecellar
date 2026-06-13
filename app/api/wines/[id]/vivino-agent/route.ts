import { NextRequest } from "next/server";
import { streamText, tool, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { scrapeVivinoUrl, searchVivinoUrl } from "@/lib/apify";

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
1. If the wine has no vivinoUrl, call findVivinoUrl to search for it.
2. Once you have a URL (either provided or found), call scrapeVivinoPage to get the wine data.
3. Call saveEnrichmentData to persist the results.
4. Report a brief summary of what was saved (score, review count, style, food pairings found).
Be concise and factual. Do not ask questions.`,
    prompt: `Enrich this wine:
Producer: ${wine.producer}
Name: ${wine.name}
Vintage: ${wine.vintage ?? "unknown"}
Current Vivino URL: ${wine.vivinoUrl ?? "not set"}`,
    tools: {
      findVivinoUrl: tool({
        description: "Search Vivino for the wine URL using producer, name, and vintage.",
        inputSchema: z.object({
          query: z.string().describe("Search query e.g. 'Opus One 2019 Napa'"),
        }),
        execute: async ({ query }) => {
          const url = await searchVivinoUrl(query);
          if (url) {
            await prisma.wine.update({ where: { id }, data: { vivinoUrl: url } });
          }
          return { url: url ?? null, found: !!url };
        },
      }),
      scrapeVivinoPage: tool({
        description: "Scrape a Vivino wine page to get score, reviews, style, food pairings, and description.",
        inputSchema: z.object({
          url: z.string().url().describe("The Vivino wine page URL"),
        }),
        execute: async ({ url }) => {
          const data = await scrapeVivinoUrl(url);
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
          await prisma.vivinoData.upsert({
            where: { wineId: id },
            create: {
              wineId: id,
              score,
              reviewCount,
              wineStyle,
              foodPairings: foodPairings.length ? JSON.stringify(foodPairings) : null,
              description,
              fetchedAt: new Date(),
            },
            update: {
              score,
              reviewCount,
              wineStyle,
              foodPairings: foodPairings.length ? JSON.stringify(foodPairings) : null,
              description,
              fetchedAt: new Date(),
            },
          });
          if (vivinoUrl) {
            await prisma.wine.update({ where: { id }, data: { vivinoUrl } });
          }
          return { saved: true };
        },
      }),
    },
  });

  return result.toTextStreamResponse();
}
