import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tape } from "@/components/ui-theme/tape";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: string;
  color?: "yellow" | "mint" | "cream" | "pink" | "white" | "blue";
  rotate?: number;
  rotation?: string;
  className?: string;
}

const colorBgStyles = {
  yellow: "bg-[#F6C945]",
  mint: "bg-[#BFE5CF]",
  cream: "bg-[#F3E6B8]",
  pink: "bg-[#F0508C]/20",
  white: "bg-white",
  blue: "bg-[#2347D6] text-white",
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "cream",
  rotate,
  rotation,
  className,
}: StatCardProps) {
  const customRotate = rotate !== undefined ? rotate : rotation ? undefined : -0.8;
  return (
    <div
      style={customRotate !== undefined ? { transform: `rotate(${customRotate}deg)` } : undefined}
      className={cn(
        "relative p-4 sm:p-5 rounded-[3px] border-2 border-ink shadow-hard transition-transform hover:rotate-0 hover:scale-[1.02] flex flex-col justify-between",
        colorBgStyles[color],
        rotation,
        className
      )}
    >
      <Tape
        color={color === "yellow" ? "blue" : color === "mint" ? "pink" : "yellow"}
        position="top-center"
      />

      <div className="flex items-center justify-between pb-2 border-b border-ink/20">
        <span className="font-mono-label text-ink tracking-wider text-[10px]">
          {title}
        </span>
        {Icon && <Icon className="h-4 w-4 text-ink" />}
      </div>

      <div className="py-2">
        <div className="font-pixel text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink truncate">
          {value}
        </div>
      </div>

      {(description || trend) && (
        <div className="pt-1.5 border-t border-ink/20 text-xs font-hand text-ink/90 flex items-center justify-between">
          <span>{description}</span>
          {trend && <span className="font-bold text-[#19A860] font-mono text-[10px]">{trend}</span>}
        </div>
      )}
    </div>
  );
}
