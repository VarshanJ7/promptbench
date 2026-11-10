import type { ReactNode } from "react";
import { cn } from "./cn";

// Consistent page title block: title, optional description and actions.
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-sm text-fg-subtle">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {title}
        </h1>
        {description && (
          <div className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-muted">
            {description}
          </div>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
