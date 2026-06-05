"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function EnrichButton({
  wineId,
  hasVivinoUrl,
}: {
  wineId: string;
  hasVivinoUrl: boolean;
}) {
  const [loading, setLoading] = useState(false);

  if (!hasVivinoUrl) return null;

  async function handleEnrich() {
    setLoading(true);
    try {
      const res = await fetch(`/api/wines/${wineId}/enrich`, { method: "POST" });
      if (!res.ok) {
        const { error } = await res.json();
        alert(error ?? "Enrichment failed");
      } else {
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnrich}
      disabled={loading}
    >
      <Sparkles size={14} className="mr-1" />
      {loading ? "Fetching…" : "Enrich"}
    </Button>
  );
}
