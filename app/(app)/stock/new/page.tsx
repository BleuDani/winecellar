import { getCellars } from "@/actions/cellar.actions";
import { getWines } from "@/actions/wine.actions";
import { StockForm } from "@/components/stock-form";

export default async function NewStockPage({
  searchParams,
}: {
  searchParams: Promise<{ wineId?: string; cellarId?: string }>;
}) {
  const sp = await searchParams;
  const [{ data: cellars }, { data: wines }] = await Promise.all([
    getCellars(),
    getWines(),
  ]);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Bottles</h1>
        <p className="text-sm text-stone-500 mt-1">
          Add bottles to a cellar
        </p>
      </div>
      <StockForm
        cellars={cellars ?? []}
        wines={wines ?? []}
        defaultCellarId={sp.cellarId}
        defaultWineId={sp.wineId}
      />
    </div>
  );
}
