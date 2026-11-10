import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "./cn";

const control =
  "w-full rounded-md border border-line-strong bg-surface-raised px-3 text-sm text-fg " +
  "placeholder:text-fg-subtle transition-colors duration-150 " +
  "hover:border-fg-subtle " +
  "focus-visible:border-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text/30 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-9", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(control, "py-2 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(control, "h-9 cursor-pointer appearance-none pr-9", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// File inputs: style the native "Choose file" button to match.
export function FileInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="file"
      className={cn(
        "block w-full cursor-pointer rounded-md border border-dashed border-line-strong bg-surface-raised p-2 text-sm text-fg-muted",
        "hover:border-fg-subtle",
        "file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-canvas file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-fg",
        "hover:file:bg-line",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-fg", className)}
      {...props}
    />
  );
}

// Label + control + optional hint, with consistent spacing.
export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-fg-subtle">{hint}</p>}
    </div>
  );
}
