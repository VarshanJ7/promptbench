"use client";

import { useActionState } from "react";
import { runPlayground, type PlaygroundState } from "./actions";

const initialState: PlaygroundState = {};

export default function PlaygroundForm({
  models,
}: {
  models: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    runPlayground,
    initialState
  );

  return (
    <div className="mt-6 max-w-2xl">
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="model" className="mb-1 block text-sm">
            Model
          </label>
          <select
            id="model"
            name="model"
            className="rounded border border-gray-600 bg-transparent px-3 py-2"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="text-black">
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="prompt" className="mb-1 block text-sm">
            Prompt
          </label>
          <textarea
            id="prompt"
            name="prompt"
            required
            rows={4}
            defaultValue="Reply with exactly one word: hello"
            className="w-full rounded border border-gray-600 bg-transparent px-3 py-2 font-mono text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-white px-4 py-2 text-black disabled:opacity-50"
        >
          {pending ? "Calling model..." : "Send"}
        </button>
      </form>

      {state.error && <p className="mt-4 text-red-400">{state.error}</p>}
      {state.result && (
        <div className="mt-6 rounded border border-gray-700 p-4">
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {state.result.text || "(empty response)"}
          </pre>
          <dl className="mt-4 grid grid-cols-4 gap-2 text-sm text-gray-400">
            <div>
              <dt>Input tokens</dt>
              <dd className="text-white">{state.result.inputTokens}</dd>
            </div>
            <div>
              <dt>Output tokens</dt>
              <dd className="text-white">{state.result.outputTokens}</dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd className="text-white">{state.result.latencyMs} ms</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd className="text-white">
                ${state.result.costUsd.toFixed(6)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
