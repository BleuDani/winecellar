import Link from "next/link";
import { getCellars } from "@/actions/cellar.actions";
import { getWines } from "@/actions/wine.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Warehouse, Wine, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const [{ data: cellars }, { data: wines }] = await Promise.all([
    getCellars(),
    getWines(),
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
        <p className="text-sm text-stone-500 mt-1">
          Overview of your wine cellars
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Total Bottles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{totalBottles}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Unique Wines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{wines?.length ?? 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              Cellars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{cellars?.length ?? 0}</span>
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
                      <p className="text-sm text-stone-500">{cellar.location}</p>
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
