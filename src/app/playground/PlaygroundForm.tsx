"use client";

import { useActionState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyIcon,
  EmptyState,
  Field,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";
import { runPlayground, type PlaygroundState } from "./actions";

const initialState: PlaygroundState = {};

export default function PlaygroundForm({
  models,
  footer,
}: {
  models: { id: string; label: string; provider?: string }[];
  footer?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(
    runPlayground,
    initialState
  );

  // Group the dropdown by provider, preserving order.
  const groups = new Map<string, typeof models>();
  for (const m of models) {
    const key = m.provider ?? "";
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Card>
        <CardHeader title="Request" />
        <CardBody>
          <form action={formAction} className="space-y-5">
            <Field label="Model" htmlFor="model">
              <Select id="model" name="model">
                {[...groups].map(([group, opts]) =>
                  group ? (
                    <optgroup key={group} label={group}>
                      {opts.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    opts.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))
                  )
                )}
              </Select>
            </Field>
            <Field label="Prompt" htmlFor="prompt">
              <Textarea
                id="prompt"
                name="prompt"
                required
                rows={6}
                defaultValue="Reply with exactly one word: hello"
                className="font-mono text-[13px]"
              />
            </Field>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending && <Spinner />}
              {pending ? "Calling model..." : "Send"}
            </Button>
          </form>
          {footer && <div className="mt-4 border-t border-line pt-3">{footer}</div>}
        </CardBody>
      </Card>

      <div aria-live="polite">
        {state.error ? (
          <Alert tone="error">{state.error}</Alert>
        ) : state.result ? (
          <Card className={pending ? "opacity-60 transition-opacity" : undefined}>
            <CardHeader title="Response" />
            <CardBody>
              <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-md border border-line bg-canvas p-3 font-mono text-[13px] leading-relaxed text-fg">
                {state.result.text || "(empty response)"}
              </pre>
              <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
                {[
                  ["Input tokens", state.result.inputTokens],
                  ["Output tokens", state.result.outputTokens],
                  ["Latency", `${state.result.latencyMs} ms`],
                  ["Cost", `$${state.result.costUsd.toFixed(6)}`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-surface px-3 py-2.5">
                    <dt className="text-xs text-fg-subtle">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium tabular-nums text-fg">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        ) : (
          <EmptyState
            icon={pending ? <Spinner className="size-4" /> : <EmptyIcon kind="reply" />}
            title={pending ? "Calling model..." : "No response yet."}
            description="The model's reply, token counts, latency and cost appear here."
            className="lg:min-h-[22rem] lg:justify-center"
          />
        )}
      </div>
    </div>
  );
}
