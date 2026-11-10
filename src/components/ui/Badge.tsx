import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line-strong bg-surface-raised text-fg-muted",
  accent: "border-accent-text/30 bg-accent-soft text-accent-text",
  success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  danger: "border-red-400/25 bg-red-400/10 text-red-300",
  info: "border-sky-400/25 bg-sky-400/10 text-sky-300",
};

const dots: Record<BadgeTone, string> = {
  neutral: "bg-fg-subtle",
  accent: "bg-accent-text",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-sky-400",
};

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium leading-4",
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", dots[tone])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
