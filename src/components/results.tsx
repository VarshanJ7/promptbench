// Presentation helpers for the Results and per-run pages. They only format
// values the pages already compute.
import { Badge, type BadgeTone } from "./ui/Badge";
import { cn } from "./ui/cn";

// Percentage text plus a thin bar. `value` is a 0–1 fraction or null.
export function AccuracyBar({
  value,
  tone = "accent",
  label,
  size = "sm",
}: {
  value: number | null;
  tone?: "accent" | "lenient";
  label: string; // e.g. "93.3%" or "—", already formatted by the page
  size?: "sm" | "lg";
}) {
  const pctWidth = value == null ? 0 : Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2.5",
        size === "lg" && "justify-start"
      )}
    >
      {size === "sm" && (
        <span className="tabular-nums text-fg">{label}</span>
      )}
      <span
        className={cn(
          "relative block overflow-hidden rounded-full bg-line",
          size === "sm" ? "h-1.5 w-14" : "h-1.5 w-full"
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            tone === "accent" ? "bg-accent-text" : "bg-fg-muted"
          )}
          style={{ width: `${pctWidth}%` }}
        />
      </span>
    </div>
  );
}

const statusTone: Record<string, BadgeTone> = {
  completed: "success",
  running: "info",
  pending: "neutral",
  failed: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      tone={statusTone[status] ?? "neutral"}
      dot
      className={status === "running" ? "[&>span:first-child]:animate-pulse" : undefined}
    >
      {status}
    </Badge>
  );
}

export function FormatBadge({
  points,
  className,
}: {
  points: string; // already formatted, e.g. "7"
  className?: string;
}) {
  return (
    <Badge
      tone="warning"
      className={className}
      title="Right label, but the output ignored the format"
    >
      +{points} format
    </Badge>
  );
}

export function BestBadge() {
  return (
    <Badge tone="accent">
      <svg className="size-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1.5l1.9 4 4.3.5-3.2 3 .9 4.3L8 11.1l-3.9 2.2.9-4.3-3.2-3 4.3-.5L8 1.5z" />
      </svg>
      best
    </Badge>
  );
}
