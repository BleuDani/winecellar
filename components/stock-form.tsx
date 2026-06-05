"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createStockItem } from "@/actions/stock.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Cellar = { id: string; name: string };
type Wine = { id: string; producer: string; name: string; vintage: number | null };

export function StockForm({
  cellars,
  wines,
  defaultCellarId,
  defaultWineId,
}: {
  cellars: Cellar[];
  wines: Wine[];
  defaultCellarId?: string;
  defaultWineId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const { data, error } = await createStockItem(formData);
      if (data) router.push(`/cellars/${data.cellarId}`);
      if (error) alert(error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="wineId">Wine *</Label>
        <Select name="wineId" defaultValue={defaultWineId} required>
          <SelectTrigger id="wineId">
            <SelectValue placeholder="Select a wine…" />
          </SelectTrigger>
          <SelectContent>
            {wines.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.producer} — {w.name}
                {w.vintage ? ` (${w.vintage})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cellarId">Cellar *</Label>
        <Select name="cellarId" defaultValue={defaultCellarId} required>
          <SelectTrigger id="cellarId">
            <SelectValue placeholder="Select a cellar…" />
          </SelectTrigger>
          <SelectContent>
            {cellars.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="purchasePrice">Purchase Price (€)</Label>
          <Input id="purchasePrice" name="purchasePrice" type="number" step="0.01" placeholder="0.00" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="binLocation">Bin Location</Label>
        <Input id="binLocation" name="binLocation" placeholder="e.g. Row 3, Shelf 2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="drinkFrom">Drink From (year)</Label>
          <Input id="drinkFrom" name="drinkFrom" type="number" placeholder="2025" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="drinkUntil">Drink Until (year)</Label>
          <Input id="drinkUntil" name="drinkUntil" type="number" placeholder="2030" />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Add to Cellar"}
      </Button>
    </form>
  );
}
