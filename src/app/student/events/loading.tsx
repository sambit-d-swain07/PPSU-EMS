import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingEvents() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <header className="border-b bg-white h-14" />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Filter skeleton */}
        <Skeleton className="h-16 w-full rounded-xl" />

        {/* Cards skeleton grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-4"
            >
              <Skeleton className="h-44 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3.5 w-3/5" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

