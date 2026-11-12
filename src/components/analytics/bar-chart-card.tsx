"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface BarChartCardProps {
  title: string;
  description?: string;
  data: Array<{ name: string; [key: string]: string | number | boolean | null | undefined }>;
  dataKeys: Array<{ key: string; name?: string; color?: string }>;
  height?: number;
  layout?: "horizontal" | "vertical";
  emptyMessage?: string;
}

export function BarChartCard({
  title,
  description,
  data,
  dataKeys,
  height = 260,
  layout = "horizontal",
  emptyMessage = "No data available for this period",
}: BarChartCardProps) {
  const hasData = data && data.length > 0 && data.some((item) =>
    dataKeys.some((dk) => Number(item[dk.key]) > 0)
  );

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
              {layout === "vertical" ? (
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    width={100}
                  />
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
                    <Bar
                      key={dk.key}
                      dataKey={dk.key}
                      name={dk.name || dk.key}
                      fill={dk.color || "#0ea5e9"}
                      radius={[0, 4, 4, 0]}
                    />
                  ))}
                </BarChart>
              ) : (
                <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    interval={0}
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
                    <Bar
                      key={dk.key}
                      dataKey={dk.key}
                      name={dk.name || dk.key}
                      fill={dk.color || "#0ea5e9"}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
