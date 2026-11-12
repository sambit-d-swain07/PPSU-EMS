import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
          <FileQuestion className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            The page or event you are looking for doesn&apos;t exist or you don&apos;t have permission to access it.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild size="sm">
            <Link href="/">
              <Home className="h-3.5 w-3.5 mr-1.5" /> Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

