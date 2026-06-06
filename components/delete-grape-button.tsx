"use client";

import { useTransition } from "react";
import { deleteGrape } from "@/actions/grape.actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteGrapeButton({
  grapeId,
  grapeName,
  wineCount,
}: {
  grapeId: string;
  grapeName: string;
  wineCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (wineCount > 0) return;
    if (!confirm(`Delete "${grapeName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const { error } = await deleteGrape(grapeId);
      if (error) alert(error);
    });
  }

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={handleClick}
      disabled={isPending || wineCount > 0}
      title={wineCount > 0 ? `Used by ${wineCount} wine(s) — cannot delete` : "Delete grape"}
    >
      <Trash2 size={14} />
      <span className="sr-only">Delete grape</span>
    </Button>
  );
}
