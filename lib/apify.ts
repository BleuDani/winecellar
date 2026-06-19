const APIFY_API_KEY = process.env.APIFY_API_KEY;
const WINE_SCRAPER_ACTOR = "mrbridge~vivino-wine-data-scraper";

export type VivinoScrapedData = {
  score: number | null;
  reviewCount: number | null;
  wineStyle: string | null;
  foodPairings: string[];
  description: string | null;
};

export async function scrapeVivinoUrl(url: string): Promise<VivinoScrapedData> {
  if (!APIFY_API_KEY) throw new Error("APIFY_API_KEY not configured");

  const res = await fetch(
    `https://api.apify.com/v2/acts/${WINE_SCRAPER_ACTOR}/run-sync-get-dataset-items?token=${APIFY_API_KEY}&timeout=60`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wines: [url], searchMode: "auto" }),
    }
  );

  if (!res.ok) throw new Error(`Apify returned ${res.status}`);

  const items: {
    average_rating?: number;
    ratings_count?: number;
    wine_type?: string;
    food_pairings?: string[];
    description?: string;
  }[] = await res.json();

  const item = items[0];
  return {
    score: item?.average_rating ?? null,
    reviewCount: item?.ratings_count ?? null,
    wineStyle: item?.wine_type ?? null,
    foodPairings: item?.food_pairings ?? [],
    description: item?.description ?? null,
  };
}

export async function searchVivinoUrl(query: string): Promise<string | null> {
  if (!APIFY_API_KEY) throw new Error("APIFY_API_KEY not configured");

  // Use Vivino's public search API endpoint
  const searchUrl = `https://www.vivino.com/api/explore/explore?q=${encodeURIComponent(query)}&language=en&min_rating=1`;
  try {
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json() as {
      explore_vintage?: { matches?: { vintage?: { wine?: { id?: number; seo_name?: string; winery?: { name?: string } } } }[] };
    };
    const matches = json?.explore_vintage?.matches ?? [];
    if (!matches.length) return null;
    const first = matches[0]?.vintage?.wine;
    if (!first?.seo_name) return null;
    return `https://www.vivino.com/wines/${first.seo_name}`;
  } catch {
    return null;
  }
}
