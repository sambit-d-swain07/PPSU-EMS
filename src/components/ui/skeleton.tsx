import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[3px] border border-ink/20 bg-paper-cream", className)}
      {...props}
    />
  );
}

export { Skeleton };

