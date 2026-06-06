import Link from "next/link";
import { getWines } from "@/actions/wine.actions";
import { buttonVariants } from "@/components/ui/button";
import { WineCard } from "@/components/wine-card";
import { Plus } from "lucide-react";

export default async function WinesPage() {
  const { data: wines, error } = await getWines();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wine Catalog</h1>
          <p className="text-sm text-stone-500 mt-1">
            {wines?.length ?? 0} wines in your collection
          </p>
        </div>
        <Link href="/wines/new" className={buttonVariants()}>
          <Plus size={16} className="mr-1" /> Add Wine
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wines?.map((wine) => (
          <WineCard key={wine.id} wine={wine} />
        ))}
        {wines?.length === 0 && (
          <p className="text-sm text-stone-500 col-span-2">
            No wines in catalog yet.
          </p>
        )}
      </div>
    </div>
  );
}
