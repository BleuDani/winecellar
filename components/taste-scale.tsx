export function TasteScale({
  lowLabel,
  highLabel,
  value,
}: {
  lowLabel: string;
  highLabel: string;
  value: number | null | undefined;
}) {
  if (value == null) return null;
  const pct = Math.max(0, Math.min(100, ((value - 1) / 4) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-muted">
        <div
          className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
    </div>
  );
}
