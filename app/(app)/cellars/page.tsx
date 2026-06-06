import Link from "next/link";
import { getCellars } from "@/actions/cellar.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateCellarDialog } from "@/components/create-cellar-dialog";

export default async function CellarsPage() {
  const { data: cellars, error } = await getCellars();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cellars</h1>
          <p className="text-sm text-stone-500 mt-1">Manage your physical cellars</p>
        </div>
        <CreateCellarDialog />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cellars?.map((cellar) => {
          const bottles = cellar.stockItems.reduce((s, i) => s + i.quantity, 0);
          return (
            <Link key={cellar.id} href={`/cellars/${cellar.id}`}>
              <Card className="hover:border-stone-400 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">{cellar.name}</CardTitle>
                  {cellar.location && (
                    <p className="text-sm text-stone-500">{cellar.location}</p>
                  )}
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <Badge variant="secondary">{bottles} {bottles === 1 ? "bottle" : "bottles"}</Badge>
                  <Badge variant="outline">{cellar._count.stockItems} entries</Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {cellars?.length === 0 && (
          <p className="text-sm text-stone-500 col-span-2">
            No cellars yet. Create your first cellar to get started.
          </p>
        )}
      </div>
    </div>
  );
}
