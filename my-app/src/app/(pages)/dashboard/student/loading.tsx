"use client";

export default function Loading() {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 dark:bg-zinc-900 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
      </div>

      {/* Grid of cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-20 h-6 rounded-full bg-gray-100 dark:bg-zinc-900 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-100 dark:bg-zinc-900 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Large area skeleton */}
      <div className="w-full h-[400px] bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 p-6 flex flex-col gap-4">
        <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
        <div className="flex-1 w-full bg-gray-50 dark:bg-zinc-900/50 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
