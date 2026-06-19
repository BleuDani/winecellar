"use client";

import { useState } from "react";
import { PhotoCapture } from "@/components/photo-capture-dialog";
import { Loader2, Sparkles } from "lucide-react";

export type ScanResult = {
  producer: string | null;
  name: string | null;
  vintage: number | null;
  region: string | null;
  country: string | null;
  grapeGuesses: string[];
  vivinoUrl: string | null;
  score: number | null;
  reviewCount: number | null;
  wineStyle: string | null;
  foodPairings: string[];
  description: string | null;
};

export function ScanLabelCard({
  onScanned,
}: {
  onScanned: (result: ScanResult, image: File) => void;
}) {
  const [scanning, setScanning] = useState(false);
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
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Couldn't read the label. Fill in the details manually.");
        return;
      }
      setScanned(true);
      onScanned(result, file);
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
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
