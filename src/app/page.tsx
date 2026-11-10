import Link from "next/link";
import { LogoMark } from "@/components/Nav";
import { buttonClasses } from "@/components/ui";

const steps = [
  { href: "/test-sets", title: "Test sets", text: "Upload a CSV of inputs and expected labels." },
  { href: "/prompts", title: "Prompts", text: "Write prompt templates with an {{input}} slot." },
  { href: "/runs", title: "Runs", text: "Run a prompt × model over a test set." },
  { href: "/results", title: "Results", text: "Compare accuracy, latency and cost; inspect failures." },
];

const providers = ["OpenAI", "Anthropic", "Gemini"];

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden rounded-xl border border-line bg-surface px-5 py-10 sm:px-10 sm:py-14">
        {/* faint grid + accent glow, purely decorative */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-accent/20 blur-3xl"
        />

        <div className="relative max-w-2xl">
          <div className="mb-5 flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="rounded-full border border-line-strong bg-surface-raised px-2.5 py-0.5 text-xs font-medium text-fg-muted">
              LLM evaluation workbench
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            PromptBench
          </h1>
          <p className="mt-3 text-base leading-relaxed text-fg-muted">
            An LLM evaluation workbench: run the same prompt across OpenAI,
            Anthropic and Gemini models on a labelled test set, and compare
            exact and lenient accuracy, latency and cost side by side.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link href="/runs" className={buttonClasses("primary")}>
              Start a run
            </Link>
            <Link href="/results" className={buttonClasses("secondary")}>
              View results
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Supported providers">
            {providers.map((p) => (
              <li
                key={p}
                className="rounded-md border border-line bg-canvas/60 px-2 py-0.5 font-mono text-xs text-fg-subtle"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <h2 className="mb-3 mt-10 text-sm font-semibold text-fg">How it works</h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="group flex h-full flex-col rounded-lg border border-line bg-surface p-4 shadow-sm shadow-black/20 transition-colors hover:border-line-strong hover:bg-surface-raised/60"
            >
              <span className="flex size-6 items-center justify-center rounded-md border border-line-strong bg-surface-raised font-mono text-xs tabular-nums text-fg-muted group-hover:border-accent-text/40 group-hover:text-accent-text">
                {i + 1}
              </span>
              <span className="mt-3 flex items-center gap-1 font-medium text-fg">
                {s.title}
                <span
                  aria-hidden="true"
                  className="text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent-text"
                >
                  →
                </span>
              </span>
              <span className="mt-1 text-sm leading-relaxed text-fg-muted">
                {s.text}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
