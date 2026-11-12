import { Skeleton } from "@/components/ui/skeleton";

export default function SingleEventAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b-2 border-ink bg-paper">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-20" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="p-6 border-2 border-ink rounded-[3px] space-y-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-2 border-ink rounded-[3px] p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 border-2 border-ink rounded-[3px] p-4 space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="border-2 border-ink rounded-[3px] p-4 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-56 w-full" />
          </div>
        </div>

        <div className="border-2 border-ink rounded-[3px] p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      </main>
    </div>
  );
}
