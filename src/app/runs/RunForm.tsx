"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Alert,
  Button,
  buttonClasses,
  Card,
  CardBody,
  CardHeader,
  EmptyIcon,
  EmptyState,
  Field,
  Select as SelectControl,
  Spinner,
} from "@/components/ui";
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
    <option key={o.id} value={o.id}>
      {o.label}
    </option>
  );

  return (
    <Field label={label} htmlFor={name}>
      <SelectControl id={name} name={name} required>
        {[...groups].map(([group, opts]) =>
          group ? (
            <optgroup key={group} label={group}>
              {opts.map(renderOption)}
            </optgroup>
          ) : (
            opts.map(renderOption)
          )
        )}
      </SelectControl>
    </Field>
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
      <EmptyState
        icon={<EmptyIcon kind="run" />}
        title="Nothing to run yet."
        description={
          <>
            You need at least one test set and one prompt before you can start
            a run.
          </>
        }
        action={
          <>
            <Link href="/test-sets" className={buttonClasses("secondary")}>
              Upload a test set
            </Link>
            <Link href="/prompts" className={buttonClasses("secondary")}>
              Create a prompt
            </Link>
          </>
        }
      />
    );
  }

  if (models.length === 0) {
    return (
      <Alert tone="warning" title="No model provider is configured.">
        Set at least one of {missingKeys.map((k) => k.env).join(", ")} and
        restart the server.
      </Alert>
    );
  }

  const s = state.summary;

  return (
    <Card>
      <CardHeader
        title="Start a run"
        description="Calls the model once per test case, 5 at a time."
      />
      <CardBody>
        <form action={formAction}>
          <div className="grid gap-5 md:grid-cols-3">
            <Select name="testSetId" label="Test set" options={testSets} />
            <Select name="promptId" label="Prompt" options={prompts} />
            <Select name="model" label="Model" options={models} />
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5 text-xs text-fg-subtle">
              <p>{limitsNote}</p>
              {missingKeys.length > 0 && (
                <p>
                  Hidden (no API key):{" "}
                  {missingKeys.map((k) => `${k.provider} (${k.env})`).join(", ")}
                </p>
              )}
            </div>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending && <Spinner />}
              {pending ? "Running... (this can take a while)" : "Start run"}
            </Button>
          </div>
        </form>

        {(state.error || s) && (
          <div className="mt-4">
            {state.error && <Alert tone="error">{state.error}</Alert>}
            {s && (
              <Alert tone="success" title="Done">
                <span className="tabular-nums">
                  exact {s.correct}/{s.total} (
                  {(s.accuracy * 100).toFixed(1)}%) · lenient{" "}
                  {s.lenientCorrect}/{s.total} (
                  {(s.lenientAccuracy * 100).toFixed(1)}%)
                  {s.errors > 0 && `, ${s.errors} API errors`} · avg{" "}
                  {s.avgLatencyMs != null
                    ? `${Math.round(s.avgLatencyMs)} ms`
                    : "n/a"}{" "}
                  · ${s.totalCostUsd.toFixed(5)}
                </span>
              </Alert>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
