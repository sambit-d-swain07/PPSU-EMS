"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LineChartCardProps {
  title: string;
  description?: string;
  data: Array<{ name: string; [key: string]: string | number | boolean | null | undefined }>;
  dataKeys: Array<{ key: string; name?: string; color?: string }>;
  height?: number;
  emptyMessage?: string;
}

export function LineChartCard({
  title,
  description,
  data,
  dataKeys,
  height = 260,
  emptyMessage = "No trend data available",
}: LineChartCardProps) {
  const hasData = data && data.length > 0;

  return (
    <Card className="border border-slate-200 shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-900">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            style={{ height }}
            className="flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg bg-slate-50/50"
          >
            {emptyMessage}
          </div>
        ) : (
          <div style={{ width: "100%", height }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                {dataKeys.map((dk) => (
                  <Line
                    key={dk.key}
                    type="monotone"
                    dataKey={dk.key}
                    name={dk.name || dk.key}
                    stroke={dk.color || "#3b82f6"}
                    strokeWidth={2}
                    dot={{ r: 3, fill: dk.color || "#3b82f6" }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
