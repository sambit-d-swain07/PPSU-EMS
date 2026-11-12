import { Button } from "@/components/ui/button";
import { Tape } from "@/components/ui-theme/tape";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-paper p-8 rounded-[3px] border-2 border-ink shadow-hard-lg text-center space-y-4 -rotate-0.5">
        <Tape color="yellow" rotation="-rotate-2" className="-top-3 left-1/2 -translate-x-1/2" />
        <div className="h-12 w-12 rounded-[3px] border-2 border-ink bg-paper-cream text-ink flex items-center justify-center mx-auto shadow-hard-sm">
          <FileQuestion className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="font-pixel text-2xl text-ink uppercase tracking-tight">PAGE NOT FOUND</h1>
          <p className="font-hand text-lg text-muted-ink">
            the page or event you are looking for doesn&apos;t exist on campus
          </p>
        </div>
        <div className="pt-2">
          <Button asChild size="sm" variant="yellow">
            <Link href="/">
              <Home className="h-3.5 w-3.5 mr-1.5" /> RETURN TO CAMPUS
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

