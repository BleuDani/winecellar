import { notFound } from "next/navigation";
import Link from "next/link";
import { getWine } from "@/actions/wine.actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockTable } from "@/components/stock-table";
import { EnrichButton } from "@/components/enrich-button";
import { Plus } from "lucide-react";

export default async function WineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: wine, error } = await getWine(id);

  if (!wine) return notFound();

  const totalBottles = wine.stockItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500">{wine.producer}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{wine.name}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            {wine.vintage && <Badge variant="outline">{wine.vintage}</Badge>}
            {wine.region && <Badge variant="outline">{wine.region}</Badge>}
            {wine.grape && <Badge variant="secondary">{wine.grape}</Badge>}
            <Badge variant="secondary">{totalBottles} bottles in stock</Badge>
          </div>
        </div>
        <Link href={`/stock/new?wineId=${id}`} className={buttonVariants()}>
          <Plus size={16} className="mr-1" /> Add to Cellar
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Vivino Data</CardTitle>
          <EnrichButton wineId={id} hasVivinoUrl={!!wine.vivinoUrl} />
        </CardHeader>
        <CardContent>
          {wine.vivinoData ? (
            <div className="flex gap-6">
              <div>
                <p className="text-3xl font-bold">
                  {wine.vivinoData.score?.toString() ?? "—"}
                </p>
                <p className="text-xs text-stone-500">score</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {wine.vivinoData.reviewCount?.toLocaleString() ?? "—"}
                </p>
                <p className="text-xs text-stone-500">reviews</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-500">
              {wine.vivinoUrl
                ? "No data fetched yet. Click Enrich to fetch."
                : "Add a Vivino URL to enable enrichment."}
            </p>
          )}
        </CardContent>
      </Card>

      {wine.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-700 whitespace-pre-wrap">{wine.notes}</p>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Stock by Cellar</h2>
        <StockTable stockItems={wine.stockItems} showCellar />
      </div>
    </div>
  );
}
