import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const APIFY_API_KEY = process.env.APIFY_API_KEY;
const APIFY_ACTOR = "vivino/wine-scraper";
const STALE_DAYS = 30;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!APIFY_API_KEY) {
    return NextResponse.json(
      { error: "APIFY_API_KEY not configured" },
      { status: 503 }
    );
  }

  const wine = await prisma.wine.findUnique({
    where: { id },
    include: { vivinoData: true },
  });

  if (!wine) {
    return NextResponse.json({ error: "Wine not found" }, { status: 404 });
  }

  if (!wine.vivinoUrl) {
    return NextResponse.json(
      { error: "No Vivino URL set for this wine" },
      { status: 400 }
    );
  }

  const staleThreshold = new Date(Date.now() - STALE_DAYS * 86400 * 1000);
  if (
    wine.vivinoData?.fetchedAt &&
    wine.vivinoData.fetchedAt > staleThreshold
  ) {
    return NextResponse.json({ cached: true, data: wine.vivinoData });
  }

  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_API_KEY}&timeout=60`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startUrls: [{ url: wine.vivinoUrl }] }),
      }
    );

    if (!runRes.ok) {
      throw new Error(`Apify returned ${runRes.status}`);
    }

    const items: { rating?: { average?: number; reviews_count?: number } }[] =
      await runRes.json();
    const item = items[0];

    const score = item?.rating?.average ?? null;
    const reviewCount = item?.rating?.reviews_count ?? null;

    const vivinoData = await prisma.vivinoData.upsert({
      where: { wineId: id },
      create: { wineId: id, score, reviewCount },
      update: { score, reviewCount, fetchedAt: new Date() },
    });

    return NextResponse.json({ data: vivinoData });
  } catch (err) {
    console.error("Vivino enrichment error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Vivino data" },
      { status: 500 }
    );
  }
}
