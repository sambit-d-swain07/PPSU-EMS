import React from "react";
import { cn } from "@/lib/utils";

export type ChipColor = "yellow" | "green" | "pink" | "blue" | "cream" | "ink";

interface TornChipProps {
  color?: ChipColor;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const chipColors: Record<ChipColor, { active: string; inactive: string }> = {
  yellow: {
    active: "bg-[#F6C945] text-[#111111] shadow-hard",
    inactive: "bg-[#F6C945]/70 text-[#111111] hover:bg-[#F6C945]",
  },
  green: {
    active: "bg-[#19A860] text-white shadow-hard",
    inactive: "bg-[#19A860]/70 text-white hover:bg-[#19A860]",
  },
  pink: {
    active: "bg-[#F0508C] text-white shadow-hard",
    inactive: "bg-[#F0508C]/70 text-white hover:bg-[#F0508C]",
  },
  blue: {
    active: "bg-[#2347D6] text-white shadow-hard",
    inactive: "bg-[#2347D6]/70 text-white hover:bg-[#2347D6]",
  },
  cream: {
    active: "bg-[#EFE6D2] text-[#111111] shadow-hard",
    inactive: "bg-[#EFE6D2]/70 text-[#111111] hover:bg-[#EFE6D2]",
  },
  ink: {
    active: "bg-[#111111] text-white shadow-hard",
    inactive: "bg-[#111111]/70 text-white hover:bg-[#111111]",
  },
};

export function TornChip({
  color = "yellow",
  active = false,
  onClick,
  className,
  children,
}: TornChipProps) {
  const colorSet = chipColors[color];
  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "relative inline-flex items-center px-3 py-1 font-mono-label border-2 border-ink transition-all duration-100 select-none cursor-pointer",
        active ? colorSet.active : colorSet.inactive,
        active ? "-translate-y-0.5" : "hover:-translate-y-0.5 hover:shadow-hard-sm",
        className
      )}
      style={{
        clipPath:
          "polygon(0% 15%, 3px 0%, calc(100% - 3px) 0%, 100% 15%, calc(100% - 2px) 50%, 100% 85%, calc(100% - 3px) 100%, 3px 100%, 0% 85%, 2px 50%)",
      }}
    >
      {children}
    </Component>
  );
}

