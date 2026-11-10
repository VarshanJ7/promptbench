"use client";

import { useActionState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  Spinner,
  Textarea,
} from "@/components/ui";
import { createPrompt, type PromptFormState } from "./actions";

const initialState: PromptFormState = {};

export default function PromptForm() {
  const [state, formAction, pending] = useActionState(
    createPrompt,
    initialState
  );

  return (
    <Card>
      <CardHeader
        title="New prompt"
        description="Each test case's input replaces the {{input}} slot."
      />
      <CardBody>
        <form action={formAction} className="space-y-5">
          <Field label="Prompt name" htmlFor="name">
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Intent classifier v1"
            />
          </Field>
          <Field
            label={
              <>
                Template (must include{" "}
                <code className="rounded bg-accent-soft px-1 font-mono text-xs text-accent-text">
                  {"{{input}}"}
                </code>
                )
              </>
            }
            htmlFor="template"
          >
            <Textarea
              id="template"
              name="template"
              required
              rows={7}
              placeholder={
                "Classify this customer message as one of: refund, shipping, other.\nReply with the label only.\n\nMessage: {{input}}"
              }
              className="font-mono text-[13px]"
            />
          </Field>
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending && <Spinner />}
            {pending ? "Saving..." : "Save prompt"}
          </Button>
          {state.error && <Alert tone="error">{state.error}</Alert>}
          {state.success && <Alert tone="success">{state.success}</Alert>}
        </form>
      </CardBody>
    </Card>
  );
}
