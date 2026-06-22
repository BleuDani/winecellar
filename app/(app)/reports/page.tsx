import Link from "next/link";
import { getWithdrawalsInRange } from "@/actions/stock.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DownloadReportPdfButton } from "@/components/download-report-pdf-button";
import { GlassWater } from "lucide-react";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDate = from || isoDate(thirtyDaysAgo);
  const endDate = to || isoDate(today);

  const { data: withdrawals, error } = await getWithdrawalsInRange(startDate, endDate);

  const totalBottles = withdrawals?.reduce((s, w) => s + w.quantity, 0) ?? 0;
  const distinctWines = new Set(withdrawals?.map((w) => w.wineId)).size;

  const pdfWithdrawals =
    withdrawals?.map((w) => ({
      id: w.id,
      wineLabel: `${w.wine.producer} — ${w.wine.name}${w.wine.vintage ? ` (${w.wine.vintage})` : ""}`,
      cellarName: w.cellar.name,
      quantity: w.quantity,
      reason: w.reason,
      observation: w.observation,
      wouldBuyAgain: w.wouldBuyAgain,
      withdrawnAt: w.withdrawnAt.toISOString(),
    })) ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Wines consumed over a chosen period
          </p>
        </div>
        <DownloadReportPdfButton
          startDate={startDate}
          endDate={endDate}
          totalBottles={totalBottles}
          distinctWines={distinctWines}
          withdrawals={pdfWithdrawals}
        />
      </div>

      <form className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3" action="/reports">
        <div className="space-y-1.5 w-full sm:w-auto">
          <Label htmlFor="from">From</Label>
          <Input id="from" name="from" type="date" defaultValue={startDate} className="w-full sm:w-auto" />
        </div>
        <div className="space-y-1.5 w-full sm:w-auto">
          <Label htmlFor="to">To</Label>
          <Input id="to" name="to" type="date" defaultValue={endDate} className="w-full sm:w-auto" />
        </div>
        <Button type="submit" className="w-full sm:w-auto">Apply</Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bottles Consumed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{totalBottles}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distinct Wines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{distinctWines}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <GlassWater size={16} /> Consumed Wines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {withdrawals && withdrawals.length > 0 ? (
            withdrawals.map((w) => (
              <div
                key={w.id}
                className="flex items-start justify-between gap-4 text-sm border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p>
                    <Link href={`/wines/${w.wineId}`} className="font-medium hover:underline">
                      {w.wine.producer} — {w.wine.name}
                      {w.wine.vintage ? ` (${w.wine.vintage})` : ""}
                    </Link>{" "}
                    <span className="text-muted-foreground">
                      · {w.quantity} {w.quantity === 1 ? "bottle" : "bottles"} from {w.cellar.name}
                    </span>
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
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No bottles consumed in this period.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
