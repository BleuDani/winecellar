const APIFY_API_KEY = process.env.APIFY_API_KEY;
const WINE_SCRAPER_ACTOR = "mrbridge~vivino-wine-data-scraper";

export type VivinoTasteProfile = {
  body: number | null;
  tannins: number | null;
  acidity: number | null;
  sweetness: number | null;
  fizziness: number | null;
};

export type VivinoLookupResult = {
  vivinoUrl: string | null;
  score: number | null;
  reviewCount: number | null;
  wineStyle: string | null;
  foodPairings: string[];
  description: string | null;
  tasteProfile: VivinoTasteProfile | null;
  flavorNotes: string[];
};

// Accepts either a direct Vivino URL or a free-text search query (e.g. "Opus One 2019 Napa") —
// the actor auto-detects which and searches Vivino itself, since Vivino's public explore API
// now blocks direct calls with a CloudFront 403.
export async function lookupVivino(query: string): Promise<VivinoLookupResult> {
  if (!APIFY_API_KEY) throw new Error("APIFY_API_KEY not configured");

  const res = await fetch(
    `https://api.apify.com/v2/acts/${WINE_SCRAPER_ACTOR}/run-sync-get-dataset-items?token=${APIFY_API_KEY}&timeout=60`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wines: [query], searchMode: "auto", includeTasteProfile: true }),
    }
  );

  if (!res.ok) throw new Error(`Apify returned ${res.status}`);

  const items: {
    vivino_url?: string;
    average_rating?: number;
    ratings_count?: number;
    wine_type?: string;
    food_pairings?: string[];
    description?: string;
    taste_profile?: {
      body?: number | null;
      tannins?: number | null;
      acidity?: number | null;
      sweetness?: number | null;
      fizziness?: number | null;
    };
    flavor_notes?: string[];
  }[] = await res.json();

  const item = items[0];
  const tp = item?.taste_profile;
  return {
    vivinoUrl: item?.vivino_url ?? null,
    score: item?.average_rating ?? null,
    reviewCount: item?.ratings_count ?? null,
    wineStyle: item?.wine_type ?? null,
    foodPairings: item?.food_pairings ?? [],
    description: item?.description ?? null,
    tasteProfile: tp
      ? {
          body: tp.body ?? null,
          tannins: tp.tannins ?? null,
          acidity: tp.acidity ?? null,
          sweetness: tp.sweetness ?? null,
          fizziness: tp.fizziness ?? null,
        }
      : null,
    flavorNotes: item?.flavor_notes ?? [],
  };
}
