"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createWine, uploadWineLabel, saveVivinoData } from "@/actions/wine.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GrapeMultiSelect } from "@/components/grape-multi-select";
import { ScanLabelCard, type ScanResult } from "@/components/scan-label-card";

type Grape = { id: string; name: string };

export function WineForm({ allGrapes }: { allGrapes: Grape[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [scanImage, setScanImage] = useState<File | null>(null);
  const [scanVersion, setScanVersion] = useState(0);

  function handleScanned(result: ScanResult, image: File) {
    setScan(result);
    setScanImage(image);
    setScanVersion((v) => v + 1);
  }

  const preselectedGrapeIds = scan
    ? allGrapes
        .filter((g) => scan.grapeGuesses.some((guess) => guess.toLowerCase() === g.name.toLowerCase()))
        .map((g) => g.id)
    : [];

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const { data, error } = await createWine(formData);
      if (error || !data) {
        alert(error);
        return;
      }

      if (scanImage) {
        const labelFormData = new FormData();
        labelFormData.append("labelImage", scanImage);
        await uploadWineLabel(data.id, labelFormData);
      }

      const hasVivinoData =
        scan &&
        (scan.score !== null ||
          scan.wineStyle !== null ||
          scan.description !== null ||
          scan.foodPairings.length > 0);
      if (scan && hasVivinoData) {
        await saveVivinoData(data.id, {
          score: scan.score,
          reviewCount: scan.reviewCount,
          wineStyle: scan.wineStyle,
          foodPairings: scan.foodPairings,
          description: scan.description,
          vivinoUrl: scan.vivinoUrl,
        });
      }

      router.push(`/wines/${data.id}`);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <ScanLabelCard onScanned={handleScanned} />

      <div key={scanVersion} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="producer">Producer *</Label>
            <Input id="producer" name="producer" defaultValue={scan?.producer ?? ""} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Wine Name *</Label>
            <Input id="name" name="name" defaultValue={scan?.name ?? ""} required />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="vintage">Vintage</Label>
            <Input
              id="vintage"
              name="vintage"
              type="number"
              placeholder="2021"
              defaultValue={scan?.vintage ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="region">Region</Label>
            <Input id="region" name="region" placeholder="Burgundy" defaultValue={scan?.region ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" placeholder="France" defaultValue={scan?.country ?? ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Grape Varieties</Label>
          <GrapeMultiSelect allGrapes={allGrapes} selectedIds={preselectedGrapeIds} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vivinoUrl">Vivino URL</Label>
          <Input
            id="vivinoUrl"
            name="vivinoUrl"
            type="url"
            placeholder="https://www.vivino.com/wines/..."
            defaultValue={scan?.vivinoUrl ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Add Wine"}
      </Button>
    </form>
  );
}
