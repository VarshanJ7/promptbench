import type {
  HTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "./cn";

// Card-like frame that scrolls sideways on narrow screens instead of
// squashing columns.
export function TableShell({
  className,
  children,
  minWidth = "min-w-[760px]",
}: {
  className?: string;
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-line bg-surface shadow-sm shadow-black/20",
        className
      )}
    >
      <table className={cn("w-full border-collapse text-left text-sm", minWidth)}>
        {children}
      </table>
    </div>
  );
}

export function THead({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("border-b border-line bg-canvas/40", className)}
      {...props}
    />
  );
}

type Align = "left" | "right" | "center";
const alignClass: Record<Align, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function Th({
  align = "left",
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { align?: Align }) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-fg-subtle first:pl-4 last:pr-4",
        alignClass[align],
        className
      )}
      {...props}
    />
  );
}

export function Tr({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-line transition-colors last:border-0 hover:bg-surface-raised/60",
        className
      )}
      {...props}
    />
  );
}

export function Td({
  align = "left",
  numeric = false,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & {
  align?: Align;
  numeric?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-3 py-3 align-middle first:pl-4 last:pr-4",
        alignClass[numeric ? "right" : align],
        numeric && "whitespace-nowrap tabular-nums",
        className
      )}
      {...props}
    />
  );
}
