import type { ReactNode } from "react";
import { cn } from "./cn";

// Dashed placeholder for "nothing here yet", with an optional next step.
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-surface/50 px-6 py-10 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-3 flex size-9 items-center justify-center rounded-full border border-line bg-surface-raised text-fg-subtle">
          {icon}
        </div>
      )}
      <div className="text-sm font-medium text-fg">{title}</div>
      {description && (
        <div className="mt-1 max-w-sm text-sm text-fg-muted">{description}</div>
      )}
      {action && <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

// Simple outline icons for empty states.
export function EmptyIcon({ kind }: { kind: "file" | "prompt" | "run" | "reply" }) {
  const paths: Record<typeof kind, ReactNode> = {
    file: (
      <>
        <path d="M4 1.75h5l3 3v9.5H4z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M9 1.75v3h3M6 8.5h4M6 11h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </>
    ),
    prompt: (
      <path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    ),
    run: <path d="M5 3l8 5-8 5z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />,
    reply: (
      <path d="M2.5 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    ),
  };
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}
