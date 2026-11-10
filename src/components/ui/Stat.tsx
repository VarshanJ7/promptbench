import type { ReactNode } from "react";
import { cn } from "./cn";

// One metric tile: small label, big tabular number, optional extra line.
export function Stat({
  label,
  value,
  footer,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface px-4 py-3.5 shadow-sm shadow-black/20",
        className
      )}
    >
      <dt className="text-xs font-medium text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-fg">
        {value}
      </dd>
      {footer && <div className="mt-2.5">{footer}</div>}
    </div>
  );
}
