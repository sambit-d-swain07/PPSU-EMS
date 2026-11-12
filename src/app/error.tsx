"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tape } from "@/components/ui-theme/tape";
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-paper p-8 rounded-[3px] border-2 border-ink shadow-hard-lg text-center space-y-4 rotate-0.5">
        <Tape color="pink" rotation="rotate-2" className="-top-3 left-1/2 -translate-x-1/2" />
        <div className="h-12 w-12 rounded-[3px] border-2 border-ink bg-[#FDF2F4] text-[#E8573A] flex items-center justify-center mx-auto shadow-hard-sm">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="font-pixel text-2xl text-ink uppercase tracking-tight">SOMETHING WENT WRONG</h1>
          <p className="font-hand text-lg text-muted-ink">
            an unexpected glitch occurred while loading this page
          </p>
        </div>
        {error.digest && (
          <p className="text-[11px] font-mono text-muted-ink bg-paper-cream p-2 rounded-[2px] border border-ink">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2 font-mono">
          <Button onClick={() => reset()} variant="yellow" size="sm" className="w-full sm:w-auto">
            <RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> TRY AGAIN
          </Button>
          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="h-3.5 w-3.5 mr-1.5" /> RETURN HOME
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

