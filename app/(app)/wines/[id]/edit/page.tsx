import { notFound } from "next/navigation";
import { getWine } from "@/actions/wine.actions";
import { getGrapes } from "@/actions/grape.actions";
import { EditWineForm } from "@/components/edit-wine-form";

export default async function EditWinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: wine }, { data: grapes }] = await Promise.all([
    getWine(id),
    getGrapes(),
  ]);

  if (!wine) return notFound();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{wine.producer}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Wine</h1>
      </div>
      <EditWineForm wine={wine} allGrapes={grapes ?? []} />
    </div>
  );
}
