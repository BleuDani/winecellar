import { notFound } from "next/navigation";
import Link from "next/link";
import { getWine } from "@/actions/wine.actions";
import { getWithdrawalsForWine } from "@/actions/stock.actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockTable } from "@/components/stock-table";
import { VivinoAgentButton } from "@/components/vivino-agent-button";
import { LabelImageUpload } from "@/components/label-image-upload";
import { StarRatingInput } from "@/components/star-rating-input";
import { TasteScale } from "@/components/taste-scale";
import { Pencil, Plus, GlassWater } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function WineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: wine, error }, { data: withdrawals }] = await Promise.all([
    getWine(id),
    getWithdrawalsForWine(id),
  ]);

  if (!wine) return notFound();

  const totalBottles = wine.stockItems.reduce((s, i) => s + i.quantity, 0);
  const vd = wine.vivinoData;
  const foodPairings: string[] = vd?.foodPairings
    ? (JSON.parse(vd.foodPairings) as string[])
    : [];
  const flavorNotes: string[] = vd?.flavorNotes
    ? (JSON.parse(vd.flavorNotes) as string[])
    : [];
  const hasTasteProfile =
    vd && [vd.tasteBody, vd.tasteTannins, vd.tasteAcidity, vd.tasteSweetness].some((v) => v != null);

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

      {/* Your rating */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <StarRatingInput wineId={id} value={wine.userRating} />
        </CardContent>
      </Card>

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
          <VivinoAgentButton wineId={id} />
        </CardHeader>
        <CardContent>
          {vd ? (
            <div className="space-y-4">
              <div className="flex gap-6">
                <div>
                  <p className="text-3xl font-bold">{vd.score?.toString() ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">score</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{vd.reviewCount?.toLocaleString() ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">reviews</p>
                </div>
                {vd.wineStyle && (
                  <div>
                    <Badge variant="secondary" className="mt-1">{vd.wineStyle}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">style</p>
                  </div>
                )}
              </div>
              {hasTasteProfile && (
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                  <TasteScale lowLabel="Light" highLabel="Bold" value={vd.tasteBody} />
                  <TasteScale lowLabel="Smooth" highLabel="Tannic" value={vd.tasteTannins} />
                  <TasteScale lowLabel="Soft" highLabel="Acidic" value={vd.tasteAcidity} />
                  <TasteScale lowLabel="Dry" highLabel="Sweet" value={vd.tasteSweetness} />
                  <TasteScale lowLabel="Still" highLabel="Fizzy" value={vd.tasteFizziness} />
                </div>
              )}
              {flavorNotes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Flavor notes</p>
                  <div className="flex flex-wrap gap-1">
                    {flavorNotes.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {foodPairings.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Pairs with</p>
                  <div className="flex flex-wrap gap-1">
                    {foodPairings.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {vd.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{vd.description}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click &quot;Enrich with AI&quot; to fetch Vivino data — the agent will find the URL
              automatically if not set.
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

      {withdrawals && withdrawals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <GlassWater size={16} /> Withdrawal History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-start justify-between gap-4 text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p>
                    <span className="font-medium">
                      {w.quantity} {w.quantity === 1 ? "bottle" : "bottles"}
                    </span>{" "}
                    <span className="text-muted-foreground">from {w.cellar.name}</span>
                  </p>
                  {w.reason && (
                    <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap">{w.reason}</p>
                  )}
                  {w.observation && (
                    <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap">{w.observation}</p>
                  )}
                  {w.wouldBuyAgain !== null && (
                    <Badge variant="outline" className="mt-1">
                      {w.wouldBuyAgain ? "Would buy again" : "Wouldn't buy again"}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground whitespace-nowrap">
                  {new Date(w.withdrawnAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
