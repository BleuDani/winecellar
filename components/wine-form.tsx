"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createWine } from "@/actions/wine.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GrapeMultiSelect } from "@/components/grape-multi-select";

type Grape = { id: string; name: string };

export function WineForm({ allGrapes }: { allGrapes: Grape[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const { data, error } = await createWine(formData);
      if (data) router.push(`/wines/${data.id}`);
      if (error) alert(error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="producer">Producer *</Label>
          <Input id="producer" name="producer" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Wine Name *</Label>
          <Input id="name" name="name" required />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="vintage">Vintage</Label>
          <Input id="vintage" name="vintage" type="number" placeholder="2021" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="region">Region</Label>
          <Input id="region" name="region" placeholder="Burgundy" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" placeholder="France" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Grape Varieties</Label>
        <GrapeMultiSelect allGrapes={allGrapes} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="vivinoUrl">Vivino URL</Label>
        <Input id="vivinoUrl" name="vivinoUrl" type="url" placeholder="https://www.vivino.com/wines/..." />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Add Wine"}
      </Button>
    </form>
  );
}
