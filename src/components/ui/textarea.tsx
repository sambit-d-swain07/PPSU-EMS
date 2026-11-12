import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[3px] border-2 border-ink bg-white px-3 py-2 text-xs text-ink font-mono placeholder:text-muted-ink transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347D6] focus-visible:shadow-hard-sm disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
