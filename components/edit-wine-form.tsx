"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateWine } from "@/actions/wine.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GrapeMultiSelect } from "@/components/grape-multi-select";

type Grape = { id: string; name: string };

type Wine = {
  id: string;
  producer: string;
  name: string;
  vintage: number | null;
  region: string | null;
  country: string | null;
  vivinoUrl: string | null;
  notes: string | null;
  grapes: { grape: Grape }[];
};

export function EditWineForm({
  wine,
  allGrapes,
}: {
  wine: Wine;
  allGrapes: Grape[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const { error } = await updateWine(wine.id, formData);
      if (error) {
        alert(error);
      } else {
        router.push(`/wines/${wine.id}`);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="producer">Producer *</Label>
          <Input id="producer" name="producer" required defaultValue={wine.producer} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Wine Name *</Label>
          <Input id="name" name="name" required defaultValue={wine.name} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="vintage">Vintage</Label>
          <Input
            id="vintage"
            name="vintage"
            type="number"
            placeholder="2021"
            defaultValue={wine.vintage ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="region">Region</Label>
          <Input id="region" name="region" placeholder="Burgundy" defaultValue={wine.region ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" placeholder="France" defaultValue={wine.country ?? ""} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Grape Varieties</Label>
        <GrapeMultiSelect
          allGrapes={allGrapes}
          selectedIds={wine.grapes.map((wg) => wg.grape.id)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="vivinoUrl">Vivino URL</Label>
        <Input
          id="vivinoUrl"
          name="vivinoUrl"
          type="url"
          placeholder="https://www.vivino.com/wines/..."
          defaultValue={wine.vivinoUrl ?? ""}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={wine.notes ?? ""} />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/wines/${wine.id}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
