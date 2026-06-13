"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

type Status = "idle" | "running" | "done" | "error";

export function VivinoAgentButton({ wineId }: { wineId: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [lines, setLines] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    setStatus("running");
    setLines([]);
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`/api/wines/${wineId}/vivino-agent`, {
        method: "POST",
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        setLines([text || "Failed to start agent"]);
        setStatus("error");
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        // Show live streaming text
        setLines([accumulated]);
      }

      setStatus("done");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setLines(["Agent error — check console"]);
        setStatus("error");
      }
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={run}
        disabled={status === "running"}
      >
        {status === "running" ? (
          <Loader2 size={14} className="mr-1 animate-spin" />
        ) : (
          <Sparkles size={14} className="mr-1" />
        )}
        {status === "running"
          ? "Running agent…"
          : status === "done"
          ? "Done! Reloading…"
          : "Enrich with AI"}
      </Button>

      {lines.length > 0 && (
        <div className="text-xs text-muted-foreground font-mono max-w-sm leading-relaxed whitespace-pre-wrap">
          {lines[0]}
        </div>
      )}
    </div>
  );
}
