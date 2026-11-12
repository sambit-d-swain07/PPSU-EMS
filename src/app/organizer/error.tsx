"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-center">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground">
            An error occurred while loading this organizer page.
          </p>
        </div>

        {error.message && (
          <div className="bg-red-50 border border-red-100 rounded-md p-3 text-xs text-red-800 text-left font-mono break-words">
            {error.message}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => reset()}
            className="text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </Button>
          <Button size="sm" asChild className="text-xs gap-1.5">
            <Link href="/organizer">
              <ArrowLeft className="h-3.5 w-3.5" /> Organizer Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

