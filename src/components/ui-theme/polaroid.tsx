import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Tape } from "./tape";

interface PolaroidProps {
  src?: string | null;
  alt?: string;
  caption?: string;
  rotate?: number;
  tapeColor?: "blue" | "yellow" | "pink" | "mint";
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}

export function Polaroid({
  src,
  alt = "Event Poster",
  caption,
  rotate = -1.5,
  tapeColor = "blue",
  className,
  imageClassName,
  children,
}: PolaroidProps) {
  return (
    <div
      style={{ transform: `rotate(${rotate}deg)` }}
      className={cn(
        "relative inline-block bg-white border-2 border-ink p-2 pb-5 sm:pb-6 shadow-hard transition-transform hover:rotate-0 hover:scale-[1.01]",
        className
      )}
    >
      <Tape color={tapeColor} position="top-center" angle={-rotate * 1.5} />

      <div className={cn("relative overflow-hidden bg-slate-100 border border-ink/30 aspect-4/3", imageClassName)}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : children ? (
          children
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-paper text-muted-ink text-xs font-mono-label">
            No Image
          </div>
        )}
      </div>

      {caption && (
        <div className="pt-2 text-center font-hand text-sm sm:text-base text-ink truncate px-1">
          {caption}
        </div>
      )}
    </div>
  );
}

