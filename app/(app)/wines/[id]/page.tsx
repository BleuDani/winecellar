import { notFound } from "next/navigation";
import Link from "next/link";
import { getWine } from "@/actions/wine.actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockTable } from "@/components/stock-table";
import { EnrichButton } from "@/components/enrich-button";
import { LabelImageUpload } from "@/components/label-image-upload";
import { Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{wine.producer}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{wine.name}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            {wine.vintage && <Badge variant="outline">{wine.vintage}</Badge>}
            {wine.country && <Badge variant="outline">{wine.country}</Badge>}
            {wine.region && <Badge variant="outline">{wine.region}</Badge>}
            {wine.grapes?.map((wg) => (
              <Badge key={wg.grape.id} variant="secondary">{wg.grape.name}</Badge>
            ))}
            <Badge variant="secondary">{totalBottles} {totalBottles === 1 ? "bottle" : "bottles"} in stock</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/wines/${id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          >
            <Pencil size={14} />
            <span className="sr-only">Edit wine</span>
          </Link>
          <Link href={`/stock/new?wineId=${id}`} className={buttonVariants()}>
            <Plus size={16} className="mr-1" /> Add to Cellar
          </Link>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Label photo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Label Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <LabelImageUpload wineId={id} currentImage={wine.labelImage ?? null} />
        </CardContent>
      </Card>

      {/* Vivino */}
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
                <p className="text-xs text-muted-foreground">score</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {wine.vivinoData.reviewCount?.toLocaleString() ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">reviews</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
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
            <p className="text-sm whitespace-pre-wrap">{wine.notes}</p>
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
