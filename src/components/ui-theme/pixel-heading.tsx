import React from "react";
import { cn } from "@/lib/utils";

interface PixelHeadingProps {
  title: string;
  caption?: string;
  tagline?: string;
  doodleBox?: boolean;
  className?: string;
  titleClassName?: string;
}

export function PixelHeading({
  title,
  caption,
  tagline,
  doodleBox = false,
  className,
  titleClassName,
}: PixelHeadingProps) {
  return (
    <div className={cn("text-center space-y-2 select-none", className)}>
      {caption && (
        <div className="font-hand text-lg sm:text-xl text-muted-ink -rotate-2 transform">
          {caption}
        </div>
      )}

      <div className="flex justify-center">
        {doodleBox ? (
          <div className="relative inline-block px-5 py-2">
            {/* Hand-drawn irregular red-orange outline SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none text-[#E8573A]"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="M 3,4 Q 50,2 97,5 Q 98,50 96,96 Q 50,97 4,95 Q 2,50 3,4 Z"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1
              className={cn(
                "font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#111111] uppercase break-words",
                titleClassName
              )}
            >
              {title}
            </h1>
          </div>
        ) : (
          <h1
            className={cn(
              "font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#111111] uppercase break-words",
              titleClassName
            )}
          >
            {title}
          </h1>
        )}
      </div>

      {tagline && (
        <p className="font-hand text-base sm:text-lg text-muted-ink">
          {tagline}
        </p>
      )}
    </div>
  );
}

