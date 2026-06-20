import { NextRequest } from "next/server";
import { lookupVivino } from "@/lib/apify";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.APIFY_API_KEY) {
    return Response.json({ error: "APIFY_API_KEY not configured" }, { status: 503 });
  }

  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return Response.json({ error: "No query provided" }, { status: 400 });
  }

  try {
    const vivino = await lookupVivino(query);
    return Response.json(vivino);
  } catch {
    return Response.json({ error: "Vivino lookup failed" }, { status: 500 });
  }
}
