import type { ReactNode } from "react";
import { cn } from "./cn";

export type AlertTone = "success" | "error" | "warning" | "info";

const tones: Record<AlertTone, string> = {
  success: "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200",
  error: "border-red-400/30 bg-red-400/[0.07] text-red-200",
  warning: "border-amber-400/30 bg-amber-400/[0.07] text-amber-200",
  info: "border-line-strong bg-surface-raised text-fg-muted",
};

const iconColor: Record<AlertTone, string> = {
  success: "text-emerald-400",
  error: "text-red-400",
  warning: "text-amber-400",
  info: "text-accent-text",
};

function Icon({ tone }: { tone: AlertTone }) {
  const common = {
    className: cn("mt-px size-4 shrink-0", iconColor[tone]),
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": true,
  } as const;
  if (tone === "success") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 8.25l1.75 1.75 3.25-3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tone === "info") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7.25v3.5M8 5.1v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  // error + warning: exclamation
  return (
    <svg {...common}>
      {tone === "warning" ? (
        <path d="M8 2.25l6 10.5H2L8 2.25z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      ) : (
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      )}
      <path d="M8 6v3M8 11.1v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Message box for success / error / warning / info. Errors are announced
// immediately to screen readers; the others politely.
export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-relaxed",
        tones[tone],
        className
      )}
    >
      <Icon tone={tone} />
      <div className="min-w-0 break-words">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title ? "mt-0.5 opacity-90" : undefined)}>{children}</div>}
      </div>
    </div>
  );
}
