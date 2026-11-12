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
import { Folder } from "@/components/ui-theme/folder";

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
  height = 240,
  layout = "horizontal",
  emptyMessage = "No data recorded for this period",
}: BarChartCardProps) {
  const hasData = data && data.length > 0 && data.some((item) =>
    dataKeys.some((dk) => Number(item[dk.key]) > 0)
  );

  return (
    <Folder tab={title.toUpperCase()} tabSide="left" color="paper" className="h-full">
      <div className="space-y-2">
        {description && (
          <p className="text-xs font-hand text-muted-ink pb-1">{description}</p>
        )}

        {!hasData ? (
          <div
            style={{ height }}
            className="flex items-center justify-center text-xs font-mono text-muted-ink border-2 border-dashed border-ink/20 rounded-[3px] bg-paper"
          >
            {emptyMessage}
          </div>
        ) : (
          <div style={{ width: "100%", height }}>
            <ResponsiveContainer width="100%" height="100%">
              {layout === "vertical" ? (
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#111111" strokeOpacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#111111", fontFamily: "var(--font-mono)" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10, fill: "#111111", fontFamily: "var(--font-mono)" }}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "2px solid #111111",
                      borderRadius: "3px",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      boxShadow: "3px 3px 0 #111111",
                    }}
                  />
                  {dataKeys.map((dk) => (
                    <Bar
                      key={dk.key}
                      dataKey={dk.key}
                      name={dk.name || dk.key}
                      fill={dk.color || "#2347D6"}
                      stroke="#111111"
                      strokeWidth={1.5}
                    />
                  ))}
                </BarChart>
              ) : (
                <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#111111" strokeOpacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#111111", fontFamily: "var(--font-mono)" }}
                    interval={0}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#111111", fontFamily: "var(--font-mono)" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "2px solid #111111",
                      borderRadius: "3px",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      boxShadow: "3px 3px 0 #111111",
                    }}
                  />
                  {dataKeys.map((dk) => (
                    <Bar
                      key={dk.key}
                      dataKey={dk.key}
                      name={dk.name || dk.key}
                      fill={dk.color || "#2347D6"}
                      stroke="#111111"
                      strokeWidth={1.5}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Folder>
  );
}
