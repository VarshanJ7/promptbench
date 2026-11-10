import { cn } from "./ui/cn";

// Shows a prompt template with every {{input}} slot highlighted.
export function PromptTemplate({
  template,
  className,
}: {
  template: string;
  className?: string;
}) {
  const parts = template.split("{{input}}");
  return (
    <pre
      className={cn(
        "overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-line bg-canvas p-3 font-mono text-xs leading-relaxed text-fg-muted",
        className
      )}
    >
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="rounded bg-accent-soft px-1 text-accent-text">
              {"{{input}}"}
            </span>
          )}
        </span>
      ))}
    </pre>
  );
}
