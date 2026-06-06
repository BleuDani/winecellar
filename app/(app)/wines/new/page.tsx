import { getGrapes } from "@/actions/grape.actions";
import { WineForm } from "@/components/wine-form";

export default async function NewWinePage() {
  const { data: grapes } = await getGrapes();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Wine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new wine to your catalog
        </p>
      </div>
      <WineForm allGrapes={grapes ?? []} />
    </div>
  );
}
