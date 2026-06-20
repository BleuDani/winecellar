"use client";

import { useState } from "react";
import { PhotoCapture } from "@/components/photo-capture-dialog";
import { Loader2, Sparkles } from "lucide-react";

export type VivinoEnrichment = {
  vivinoUrl: string | null;
  score: number | null;
  reviewCount: number | null;
  wineStyle: string | null;
  foodPairings: string[];
  description: string | null;
};

export type ScanResult = {
  producer: string | null;
  name: string | null;
  vintage: number | null;
  region: string | null;
  country: string | null;
  grapeGuesses: string[];
} & VivinoEnrichment;

const emptyVivino: VivinoEnrichment = {
  vivinoUrl: null,
  score: null,
  reviewCount: null,
  wineStyle: null,
  foodPairings: [],
  description: null,
};

export function ScanLabelCard({
  onScanned,
  onVivinoEnriched,
}: {
  onScanned: (result: ScanResult, image: File) => void;
  onVivinoEnriched: (vivino: VivinoEnrichment) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  async function handlePhoto(file: File) {
    setError(null);
    setScanning(true);
    setScanned(false);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/wines/scan-label", { method: "POST", body: formData });
      const extracted = await res.json();
      if (!res.ok) {
        setError(extracted.error ?? "Couldn't read the label. Fill in the details manually.");
        return;
      }
      setScanned(true);
      onScanned({ ...extracted, ...emptyVivino }, file);

      // Vivino lookup is a slow live scrape — fetch it separately in the
      // background so field auto-fill isn't blocked waiting on it.
      const query = [extracted.producer, extracted.name, extracted.vintage]
        .filter(Boolean)
        .join(" ");
      if (query) {
        setEnriching(true);
        fetch("/api/wines/lookup-vivino", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((vivino) => {
            if (vivino) onVivinoEnriched(vivino);
          })
          .catch(() => {})
          .finally(() => setEnriching(false));
      }
    } catch {
      setError("Couldn't read the label. Fill in the details manually.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles size={14} />
        Scan a label
      </div>
      <p className="text-sm text-muted-foreground">
        Take or upload a photo of the wine label to auto-fill the fields below.
      </p>
      <div className="flex items-center gap-3">
        <PhotoCapture onPhoto={handlePhoto} disabled={scanning} />
        {scanning && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Reading label…
          </span>
        )}
      </div>
      {scanned && !scanning && !error && (
        <p className="text-sm text-muted-foreground">
          Label scanned — review the fields below before saving.
          {enriching && " Looking up Vivino…"}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
