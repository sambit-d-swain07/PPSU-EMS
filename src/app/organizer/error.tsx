"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tape } from "@/components/ui-theme/tape";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OrganizerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Organizer error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-paper rounded-[3px] border-2 border-ink p-8 shadow-hard-lg space-y-4 text-center -rotate-0.5">
        <Tape color="yellow" rotation="-rotate-1" className="-top-3 left-1/2 -translate-x-1/2" />
        <div className="h-12 w-12 rounded-[3px] border-2 border-ink bg-[#FDF2F4] text-[#E8573A] flex items-center justify-center mx-auto shadow-hard-sm">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-pixel text-2xl text-ink uppercase tracking-tight">
            SOMETHING WENT WRONG
          </h2>
          <p className="font-hand text-lg text-muted-ink">
            an error occurred while loading this organizer view
          </p>
        </div>

        {error.message && (
          <div className="bg-[#FDF2F4] border-2 border-ink rounded-[2px] p-3 text-xs text-[#E8573A] text-left font-mono break-words shadow-hard-sm">
            {error.message}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-2 font-mono">
          <Button
            size="sm"
            variant="outline"
            onClick={() => reset()}
            className="text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> TRY AGAIN
          </Button>
          <Button size="sm" variant="yellow" asChild className="text-xs gap-1.5">
            <Link href="/organizer">
              <ArrowLeft className="h-3.5 w-3.5" /> BACK TO DESK
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

