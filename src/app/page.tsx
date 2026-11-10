import Link from "next/link";

const steps = [
  { href: "/test-sets", title: "1. Test sets", text: "Upload a CSV of inputs and expected labels." },
  { href: "/prompts", title: "2. Prompts", text: "Write prompt templates with an {{input}} slot." },
  { href: "/runs", title: "3. Runs", text: "Run a prompt × model over a test set." },
  { href: "/results", title: "4. Results", text: "Compare accuracy, latency and cost; inspect failures." },
];

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">PromptBench</h1>
      <p className="mt-2 max-w-2xl text-gray-400">
        An LLM evaluation workbench: run the same prompt across OpenAI,
        Anthropic and Gemini models on a labelled test set, and compare exact
        and lenient accuracy, latency and cost side by side.
      </p>
      <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
        {steps.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded border border-gray-700 p-4 hover:border-gray-400"
          >
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-gray-400">{s.text}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
