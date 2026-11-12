"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-paper group-[.toaster]:text-ink group-[.toaster]:border-2 group-[.toaster]:border-ink group-[.toaster]:rounded-[3px] group-[.toaster]:shadow-hard group-[.toaster]:font-mono text-xs",
          description: "group-[.toast]:text-muted-ink",
          actionButton:
            "group-[.toast]:bg-[#F6C945] group-[.toast]:text-ink group-[.toast]:border group-[.toast]:border-ink",
          cancelButton:
            "group-[.toast]:bg-paper-cream group-[.toast]:text-ink group-[.toast]:border group-[.toast]:border-ink",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

