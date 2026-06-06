import Link from "next/link";
import { notFound } from "next/navigation";
import { getCellar } from "@/actions/cellar.actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StockTable } from "@/components/stock-table";
import { EditCellarDialog } from "@/components/edit-cellar-dialog";
import { Plus } from "lucide-react";

export default async function CellarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: cellar, error } = await getCellar(id);

  if (!cellar) return notFound();

  const totalBottles = cellar.stockItems.reduce(
    (s: number, i: { quantity: number }) => s + i.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{cellar.name}</h1>
            <EditCellarDialog cellar={cellar} />
          </div>
          {cellar.location && (
            <p className="text-sm text-muted-foreground mt-1">{cellar.location}</p>
          )}
          <Badge variant="secondary" className="mt-2">
            {totalBottles} bottles
          </Badge>
        </div>
        <Link href={`/stock/new?cellarId=${id}`} className={buttonVariants()}>
          <Plus size={16} className="mr-1" /> Add Bottles
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <StockTable stockItems={cellar.stockItems} showWine />
    </div>
  );
}
