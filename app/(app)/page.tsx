import Link from "next/link";
import { getCellars } from "@/actions/cellar.actions";
import { getWines, getWinesByGrape, getWinesByCountry } from "@/actions/wine.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WinePieChart } from "@/components/wine-pie-chart";
import { Warehouse, Wine, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function topN(data: { name: string; value: number }[], n: number) {
  if (data.length <= n) return data;
  const top = data.slice(0, n);
  const rest = data.slice(n).reduce((sum, d) => sum + d.value, 0);
  return [...top, { name: "Other", value: rest }];
}

export default async function DashboardPage() {
  const [{ data: cellars }, { data: wines }, grapeData, countryData] =
    await Promise.all([
      getCellars(),
      getWines(),
      getWinesByGrape(),
      getWinesByCountry(),
    ]);

  const totalBottles =
    cellars?.reduce(
      (sum, c) => sum + c.stockItems.reduce((s, i) => s + i.quantity, 0),
      0
    ) ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your wine cellars
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bottles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{totalBottles}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Wines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{wines?.length ?? 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cellars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{cellars?.length ?? 0}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Grape</CardTitle>
          </CardHeader>
          <CardContent>
            <WinePieChart data={topN(grapeData, 8)} title="" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Country</CardTitle>
          </CardHeader>
          <CardContent>
            <WinePieChart data={topN(countryData, 8)} title="" />
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Warehouse size={18} /> Cellars
          </h2>
          <Link href="/cellars" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {cellars?.map((cellar) => {
            const bottles = cellar.stockItems.reduce(
              (s, i) => s + i.quantity,
              0
            );
            return (
              <Link key={cellar.id} href={`/cellars/${cellar.id}`}>
                <Card className="hover:border-stone-400 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{cellar.name}</CardTitle>
                    {cellar.location && (
                      <p className="text-sm text-muted-foreground">{cellar.location}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{bottles} bottles</Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/stock/new" className={buttonVariants()}>
          <Plus size={16} className="mr-1" /> Add Bottles
        </Link>
        <Link href="/wines/new" className={cn(buttonVariants({ variant: "outline" }))}>
          <Wine size={16} className="mr-1" /> Add Wine
        </Link>
      </div>
    </div>
  );
}
