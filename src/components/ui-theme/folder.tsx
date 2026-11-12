import React from "react";
import { cn } from "@/lib/utils";

export type FolderColor = "paper" | "ink" | "yellow" | "cream" | "blue";

interface FolderProps {
  tab?: React.ReactNode;
  tabTitle?: React.ReactNode;
  tabSide?: "left" | "right";
  tabPosition?: "left" | "right";
  color?: FolderColor;
  className?: string;
  contentClassName?: string;
  stack?: boolean;
  children: React.ReactNode;
}

const colorBgStyles: Record<FolderColor, string> = {
  paper: "bg-[#FFFFFF] text-[#111111]",
  ink: "bg-[#111111] text-[#FFFFFF]",
  yellow: "bg-[#F6C945] text-[#111111]",
  cream: "bg-[#EFE6D2] text-[#111111]",
  blue: "bg-[#2347D6] text-[#FFFFFF]",
};

export function Folder({
  tab,
  tabTitle,
  tabSide,
  tabPosition,
  color = "paper",
  className,
  contentClassName,
  stack = false,
  children,
}: FolderProps) {
  const resolvedTab = tab ?? tabTitle;
  const isLeft = (tabSide ?? tabPosition ?? "left") === "left";
  const tabHeight = 34; // px
  const tabWidth = 180; // px
  const tabCut = 24; // px slant

  // Outer polygon for border
  const outerClip = isLeft
    ? `polygon(0 0, ${tabWidth}px 0, ${tabWidth + tabCut}px ${tabHeight}px, 100% ${tabHeight}px, 100% 100%, 0 100%)`
    : `polygon(0 ${tabHeight}px, calc(100% - ${tabWidth + tabCut}px) ${tabHeight}px, calc(100% - ${tabWidth}px) 0, 100% 0, 100% 100%, 0 100%)`;

  // Inner polygon inset by 2px
  const innerClip = isLeft
    ? `polygon(0 0, ${tabWidth - 1}px 0, ${tabWidth + tabCut - 2}px ${tabHeight - 2}px, 100% ${tabHeight - 2}px, 100% 100%, 0 100%)`
    : `polygon(0 ${tabHeight - 2}px, calc(100% - ${tabWidth + tabCut - 2}px) ${tabHeight - 2}px, calc(100% - ${tabWidth - 1}px) 0, 100% 0, 100% 100%, 0 100%)`;

  return (
    <div
      className={cn(
        "relative group transition-transform duration-150",
        stack && "-mt-6 sm:-mt-8",
        className
      )}
      style={{
        filter: "drop-shadow(3px 3px 0 #111111)",
      }}
    >
      {/* Outer Border Layer */}
      <div
        className="w-full bg-[#111111] p-[2px]"
        style={{
          clipPath: outerClip,
        }}
      >
        {/* Inner Colored Card Body */}
        <div
          className={cn("w-full transition-colors", colorBgStyles[color])}
          style={{
            clipPath: innerClip,
          }}
        >
          {/* Tab Header Slot */}
          <div
            style={{ height: `${tabHeight}px` }}
            className={cn(
              "flex items-center px-4 font-mono-label select-none",
              isLeft ? "justify-start" : "justify-end pr-6",
              color === "ink" || color === "blue" ? "text-white/90" : "text-[#111111]"
            )}
          >
            {resolvedTab ? (
              <div className="flex items-center gap-2 max-w-[155px] truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-current inline-block shrink-0" />
                <span className="truncate">{resolvedTab}</span>
              </div>
            ) : null}
          </div>

          {/* Folder Main Content */}
          <div className={cn("p-4 sm:p-6", contentClassName)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

