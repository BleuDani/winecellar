"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#c2410c", "#b45309", "#92400e", "#78350f",
  "#7f1d1d", "#991b1b", "#166534", "#15803d",
  "#1e40af", "#1d4ed8", "#6d28d9", "#7e22ce",
  "#be185d", "#9d174d", "#0e7490", "#0369a1",
];

type ChartData = { name: string; value: number }[];

export function WinePieChart({ data, title }: { data: ChartData; title: string }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px]">
        <p className="text-sm text-muted-foreground">No data yet.</p>
      </div>
    );
  }

  return (
    <div>
      {title && <p className="text-sm font-medium mb-2">{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="40%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [value, name]}
            contentStyle={{ fontSize: 12, borderRadius: 6 }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, lineHeight: "1.9" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
