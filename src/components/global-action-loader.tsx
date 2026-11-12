"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Tape } from "@/components/ui-theme/tape";

export function GlobalActionLoader() {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("Updating campus records...");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading whenever route changes
  React.useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  React.useEffect(() => {
    // 1. Listen to form submissions
    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (!form) return;

      // Skip if explicitly marked
      if (form.getAttribute("data-no-global-loader") === "true") return;

      // Only show if form passes basic HTML5 client validation
      if (form.checkValidity && !form.checkValidity()) return;

      const customMsg = form.getAttribute("data-loading-message");
      setMessage(customMsg || "Processing your submission...");
      setLoading(true);
    };

    // 2. Custom events for non-form buttons or server actions
    const handleShow = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      setMessage(customEvent.detail?.message || "Communicating with server...");
      setLoading(true);
    };

    const handleHide = () => {
      setLoading(false);
    };

    document.addEventListener("submit", handleFormSubmit, true);
    window.addEventListener("show-global-loader", handleShow);
    window.addEventListener("hide-global-loader", handleHide);

    return () => {
      document.removeEventListener("submit", handleFormSubmit, true);
      window.removeEventListener("show-global-loader", handleShow);
      window.removeEventListener("hide-global-loader", handleHide);
    };
  }, []);

  // Safety fallback: auto-clear after 15 seconds so UI never gets stuck
  React.useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (!loading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[3px] flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div className="relative bg-paper border-2 border-ink rounded-[3px] p-6 sm:p-8 max-w-sm w-full text-center shadow-hard-lg -rotate-0.5 space-y-4">
        <Tape color="yellow" rotation="-rotate-2" className="-top-3 left-1/2 -translate-x-1/2" />

        <div className="h-14 w-14 mx-auto rounded-[3px] border-2 border-ink bg-[#F6C945] flex items-center justify-center shadow-hard-sm">
          <Loader2 className="h-7 w-7 text-ink animate-spin" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-pixel text-xl sm:text-2xl font-bold text-ink uppercase tracking-tight">
            PROCESSING...
          </h2>
          <p className="font-mono text-xs text-muted-ink">
            {message}
          </p>
        </div>

        <div className="pt-2 border-t border-ink/20 font-hand text-base text-ink font-bold">
          Hold on, synchronizing changes! ✦
        </div>
      </div>
    </div>
  );
}
