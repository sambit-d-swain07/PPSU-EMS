import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[3px] border-2 border-ink font-mono-label transition-all active:translate-x-[1px] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-white hover:-translate-y-0.5 hover:shadow-hard",
        destructive:
          "bg-[#F0508C] text-white hover:-translate-y-0.5 hover:shadow-hard-pink",
        outline:
          "bg-white text-ink hover:bg-paper hover:-translate-y-0.5 hover:shadow-hard-sm",
        secondary:
          "bg-[#EFE6D2] text-ink hover:-translate-y-0.5 hover:shadow-hard-sm",
        yellow:
          "bg-[#F6C945] text-ink hover:-translate-y-0.5 hover:shadow-hard",
        green:
          "bg-[#19A860] text-white hover:-translate-y-0.5 hover:shadow-hard",
        ghost:
          "border-transparent hover:bg-black/5 hover:border-ink/30",
        link:
          "border-transparent text-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-10 px-6 text-xs",
        icon: "h-8 w-8 p-0",
        "icon-sm": "h-6 w-6 p-0 text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
