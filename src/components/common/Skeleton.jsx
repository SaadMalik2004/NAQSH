export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200/80 rounded-xl ${className}`} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-sm">
      <Skeleton className="w-full h-[360px] rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}
