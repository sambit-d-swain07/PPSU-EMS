import React from "react";
import { cn } from "@/lib/utils";

interface TapeProps {
  color?: "blue" | "yellow" | "pink" | "mint" | "cream";
  position?: "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right";
  angle?: number;
  rotation?: string;
  className?: string;
}

const colorStyles = {
  blue: "bg-[#2347D6]/40 border-t border-b border-[#2347D6]/30",
  yellow: "bg-[#F6C945]/70 border-t border-b border-[#D4A317]/40",
  pink: "bg-[#F0508C]/50 border-t border-b border-[#F0508C]/40",
  mint: "bg-[#BFE5CF]/70 border-t border-b border-[#19A860]/30",
  cream: "bg-[#F3E6B8]/75 border-t border-b border-[#111111]/20",
};

const positionStyles = {
  "top-left": "-top-3 -left-3 -rotate-12",
  "top-right": "-top-3 -right-3 rotate-12",
  "top-center": "-top-3.5 left-1/2 -translate-x-1/2 -rotate-2",
  "bottom-left": "-bottom-3 -left-3 rotate-12",
  "bottom-right": "-bottom-3 -right-3 -rotate-12",
};

export function Tape({
  color = "yellow",
  position = "top-center",
  angle,
  rotation,
  className,
}: TapeProps) {
  const customTransform = angle !== undefined ? { transform: `rotate(${angle}deg)` } : undefined;

  return (
    <div
      style={customTransform}
      className={cn(
        "absolute z-20 pointer-events-none h-6 w-16 shadow-2xs backdrop-blur-[0.5px]",
        colorStyles[color],
        position && !angle && !rotation ? positionStyles[position] : "",
        rotation,
        className
      )}
    >
      {/* Subtle jagged edges on ends */}
      <div className="absolute inset-y-0 left-0 w-1 bg-transparent border-r border-dashed border-black/20" />
      <div className="absolute inset-y-0 right-0 w-1 bg-transparent border-l border-dashed border-black/20" />
    </div>
  );
}

