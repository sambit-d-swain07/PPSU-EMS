import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[3px] border-2 border-ink px-2 py-0.5 font-mono-label shadow-hard-sm transition-transform select-none",
  {
    variants: {
      variant: {
        default: "bg-ink text-white",
        secondary: "bg-[#F3E6B8] text-ink", // cream
        destructive: "bg-[#F0508C] text-white", // pink
        outline: "bg-white text-ink",
        success: "bg-[#BFE5CF] text-ink", // mint
        warning: "bg-[#F6C945] text-ink", // yellow
        info: "bg-[#2347D6] text-white", // blue
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
