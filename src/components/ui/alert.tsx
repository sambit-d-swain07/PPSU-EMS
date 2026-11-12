import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-[3px] border-2 border-ink p-3.5 shadow-hard-sm text-xs [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-3.5 [&>svg]:top-3.5",
  {
    variants: {
      variant: {
        default: "bg-white text-ink [&>svg]:text-ink",
        destructive:
          "bg-[#F0508C]/15 border-[#F0508C] text-[#111111] [&>svg]:text-[#F0508C]",
        warning:
          "bg-[#F6C945]/20 border-ink text-[#111111] [&>svg]:text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-mono-label tracking-tight text-ink", className)}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs font-sans text-ink leading-relaxed", className)}
      {...props}
    />
  );
}
