import { cn } from "./cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-surface-raised", className)} />
  );
}

// Placeholder list of cards. Keeps the "Loading..." text for screen readers.
export function SkeletonList({
  rows = 3,
  className,
  rowClassName = "h-16",
}: {
  rows?: number;
  className?: string;
  rowClassName?: string;
}) {
  return (
    <div aria-busy="true" className={cn("space-y-2.5", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-lg border border-line bg-surface p-4",
            rowClassName
          )}
        >
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="mt-3 h-3 w-2/3" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Placeholder for a form card (labels + fields + button).
export function SkeletonForm({
  fields = 2,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div
      aria-busy="true"
      className={cn("rounded-lg border border-line bg-surface p-4 sm:p-5", className)}
    >
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="mb-5">
          <Skeleton className="mb-2 h-3 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-9 w-28 rounded-md" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
