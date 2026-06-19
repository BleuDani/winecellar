"use client";

import { useMemo, useState } from "react";
import { WineCard } from "@/components/wine-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Wine = {
  id: string;
  producer: string;
  name: string;
  vintage: number | null;
  region: string | null;
  country: string | null;
  grapes: { grape: { id: string; name: string } }[];
  labelImage: string | null;
  stockItems: { quantity: number; cellar: { id: string; name: string } }[];
  vivinoData: { score: unknown } | null;
};

const ALL = "all";

export function WineCatalog({
  wines,
  cellars,
}: {
  wines: Wine[];
  cellars: { id: string; name: string }[];
}) {
  const [grape, setGrape] = useState(ALL);
  const [country, setCountry] = useState(ALL);
  const [cellarId, setCellarId] = useState(ALL);
  const [inStockOnly, setInStockOnly] = useState(false);

  const grapeOptions = useMemo(() => {
    const names = new Set<string>();
    wines.forEach((w) => w.grapes.forEach((wg) => names.add(wg.grape.name)));
    return Array.from(names).sort();
  }, [wines]);

  const countryOptions = useMemo(() => {
    const names = new Set<string>();
    wines.forEach((w) => w.country && names.add(w.country));
    return Array.from(names).sort();
  }, [wines]);

  const filtered = useMemo(() => {
    return wines.filter((wine) => {
      if (grape !== ALL && !wine.grapes.some((wg) => wg.grape.name === grape)) return false;
      if (country !== ALL && wine.country !== country) return false;
      if (cellarId !== ALL && !wine.stockItems.some((si) => si.cellar.id === cellarId)) return false;
      if (inStockOnly) {
        const total = wine.stockItems.reduce((s, i) => s + i.quantity, 0);
        if (total <= 0) return false;
      }
      return true;
    });
  }, [wines, grape, country, cellarId, inStockOnly]);

  const hasActiveFilters = grape !== ALL || country !== ALL || cellarId !== ALL || inStockOnly;

  function clearFilters() {
    setGrape(ALL);
    setCountry(ALL);
    setCellarId(ALL);
    setInStockOnly(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={grape} onValueChange={(v) => setGrape(v ?? ALL)}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Grape" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All grapes</SelectItem>
            {grapeOptions.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={country} onValueChange={(v) => setCountry(v ?? ALL)}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All countries</SelectItem>
            {countryOptions.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cellarId} onValueChange={(v) => setCellarId(v ?? ALL)}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Cellar">
              {(value: string) => {
                if (value === ALL) return "All cellars";
                const c = cellars.find((c) => c.id === value);
                return c ? c.name : "Cellar";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All cellars</SelectItem>
            {cellars.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg border border-input cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="accent-primary"
          />
          In stock only
        </label>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X size={14} /> Clear filters
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {wines.length} wines
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((wine) => (
          <WineCard key={wine.id} wine={wine} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-stone-500 col-span-2">
            No wines match these filters.
          </p>
        )}
      </div>
    </div>
  );
}
