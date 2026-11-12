"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            An unexpected error occurred while processing your request. Please try again.
          </p>
        </div>
        {error.digest && (
          <p className="text-[11px] font-mono text-slate-400 bg-slate-50 p-2 rounded border border-slate-100">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button onClick={() => reset()} size="sm" className="w-full sm:w-auto">
            <RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Try again
          </Button>
          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="h-3.5 w-3.5 mr-1.5" /> Return home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

