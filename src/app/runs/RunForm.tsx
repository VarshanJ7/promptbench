"use client";

import { useActionState } from "react";
import { startRun, type RunFormState } from "./actions";

type Option = { id: string; label: string; group?: string };

const initialState: RunFormState = {};

function Select({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: Option[];
}) {
  // Group options under <optgroup> when they carry a group (e.g. provider).
  const groups = new Map<string, Option[]>();
  for (const o of options) {
    const key = o.group ?? "";
    groups.set(key, [...(groups.get(key) ?? []), o]);
  }
  const renderOption = (o: Option) => (
    <option key={o.id} value={o.id} className="text-black">
      {o.label}
    </option>
  );

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required
        className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
      >
        {[...groups].map(([group, opts]) =>
          group ? (
            <optgroup key={group} label={group} className="text-black">
              {opts.map(renderOption)}
            </optgroup>
          ) : (
            opts.map(renderOption)
          )
        )}
      </select>
    </div>
  );
}

export default function RunForm({
  testSets,
  prompts,
  models,
  missingKeys,
  limitsNote,
}: {
  testSets: Option[];
  prompts: Option[];
  models: Option[];
  missingKeys: { provider: string; env: string }[];
  limitsNote: string;
}) {
  const [state, formAction, pending] = useActionState(startRun, initialState);

  if (testSets.length === 0 || prompts.length === 0) {
    return (
      <p className="mt-6 text-gray-400">
        You need at least one test set (
        <a href="/test-sets" className="underline">
          upload one
        </a>
        ) and one prompt (
        <a href="/prompts" className="underline">
          create one
        </a>
        ) before you can start a run.
      </p>
    );
  }

  if (models.length === 0) {
    return (
      <p className="mt-6 text-gray-400">
        No model provider is configured. Set at least one of{" "}
        {missingKeys.map((k) => k.env).join(", ")} and restart the server.
      </p>
    );
  }

  const s = state.summary;

  return (
    <div className="mt-6 max-w-md">
      <form action={formAction} className="space-y-4">
        <Select name="testSetId" label="Test set" options={testSets} />
        <Select name="promptId" label="Prompt" options={prompts} />
        <Select name="model" label="Model" options={models} />
        {missingKeys.length > 0 && (
          <p className="text-xs text-gray-500">
            Hidden (no API key):{" "}
            {missingKeys.map((k) => `${k.provider} (${k.env})`).join(", ")}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-white px-4 py-2 text-black disabled:opacity-50"
        >
          {pending ? "Running... (this can take a while)" : "Start run"}
        </button>
        <p className="text-xs text-gray-500">{limitsNote}</p>
      </form>

      {state.error && <p className="mt-4 text-red-400">{state.error}</p>}
      {s && (
        <p className="mt-4 text-green-400">
          Done: exact {s.correct}/{s.total} (
          {(s.accuracy * 100).toFixed(1)}%) · lenient {s.lenientCorrect}/
          {s.total} ({(s.lenientAccuracy * 100).toFixed(1)}%)
          {s.errors > 0 && `, ${s.errors} API errors`} · avg{" "}
          {s.avgLatencyMs != null ? `${Math.round(s.avgLatencyMs)} ms` : "n/a"}{" "}
          · ${s.totalCostUsd.toFixed(5)}
        </p>
      )}
    </div>
  );
}
