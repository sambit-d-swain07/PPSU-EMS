import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function RegistrationsLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-20" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>

        <Skeleton className="h-10 w-48" />

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="space-y-2 w-full sm:w-2/3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-9 w-28 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

