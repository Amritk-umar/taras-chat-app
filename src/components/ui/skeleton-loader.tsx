export function SidebarSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 w-full">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="h-9 w-full bg-slate-100 dark:bg-slate-900 rounded-lg animate-pulse" />
      </div>

      {/* List Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-2 w-16 bg-slate-100 dark:bg-slate-900 rounded animate-pulse" />
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-8 overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
        <div className="flex flex-col items-start gap-3 animate-pulse">
          <div className="h-12 w-48 bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-tl-none" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-tl-none" />
        </div>
        
        <div className="flex flex-col items-end gap-3 animate-pulse">
          <div className="h-12 w-56 bg-blue-100 dark:bg-blue-900/20 rounded-2xl rounded-tr-none" />
          <div className="h-10 w-40 bg-blue-100 dark:bg-blue-900/20 rounded-2xl rounded-tr-none" />
        </div>

        <div className="flex flex-col items-start gap-3 animate-pulse">
          <div className="h-16 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-tl-none" />
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="h-10 w-full bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
      </div>
    </div>
  );
}