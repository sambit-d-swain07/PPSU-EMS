import React from "react";
import { cn } from "@/lib/utils";

interface StickerProps {
  color?: "mint" | "cream" | "yellow" | "pink" | "blue" | "paper" | "white";
  variant?: "mint" | "cream" | "yellow" | "pink" | "blue" | "paper" | "white" | string;
  status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | string;
  rotate?: number;
  className?: string;
  children: React.ReactNode;
}

const statusColorMap: Record<string, "cream" | "yellow" | "mint" | "pink"> = {
  DRAFT: "cream",
  PENDING: "yellow",
  APPROVED: "mint",
  REJECTED: "pink",
};

const colorStyles = {
  mint: "bg-[#BFE5CF] text-[#111111] border-[#111111]",
  cream: "bg-[#F3E6B8] text-[#111111] border-[#111111]",
  yellow: "bg-[#F6C945] text-[#111111] border-[#111111]",
  pink: "bg-[#F0508C] text-white border-[#111111]",
  blue: "bg-[#2347D6] text-white border-[#111111]",
  paper: "bg-[#F7F6F2] text-[#111111] border-[#111111]",
  white: "bg-white text-[#111111] border-[#111111]",
};

export function Sticker({
  color,
  variant,
  status,
  rotate = 0,
  className,
  children,
}: StickerProps) {
  const chosenColor = color || (variant && variant in colorStyles ? variant : undefined);
  const resolvedColor =
    (chosenColor || (status ? statusColorMap[status] : undefined) || "cream") as keyof typeof colorStyles;
  const style = rotate !== 0 ? { transform: `rotate(${rotate}deg)` } : undefined;

  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 border-2 rounded-[3px] font-mono-label shadow-hard-sm transition-transform hover:scale-105 select-none",
        colorStyles[resolvedColor],
        className
      )}
    >
      {children}
    </span>
  );
}

