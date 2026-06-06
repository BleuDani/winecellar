"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type Grape = { id: string; name: string };

export function GrapeMultiSelect({
  allGrapes,
  selectedIds = [],
}: {
  allGrapes: Grape[];
  selectedIds?: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [search, setSearch] = useState("");

  const filtered = allGrapes.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const selectedGrapes = allGrapes.filter((g) => selected.has(g.id));

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search grapes…"
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="max-h-44 overflow-y-auto rounded-md border border-input bg-background divide-y divide-border">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground px-3 py-2">No grapes found.</p>
        )}
        {filtered.map((grape) => (
          <label
            key={grape.id}
            className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent"
          >
            <input
              type="checkbox"
              name="grapeId"
              value={grape.id}
              checked={selected.has(grape.id)}
              onChange={() => toggle(grape.id)}
              className="accent-primary"
            />
            {grape.name}
          </label>
        ))}
      </div>

      {selectedGrapes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedGrapes.map((grape) => (
            <Badge
              key={grape.id}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer"
              onClick={() => toggle(grape.id)}
            >
              {grape.name}
              <X size={10} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
