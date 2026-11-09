"use client";

import { useActionState } from "react";
import { createPrompt, type PromptFormState } from "./actions";

const initialState: PromptFormState = {};

export default function PromptForm() {
  const [state, formAction, pending] = useActionState(
    createPrompt,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm">
          Prompt name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Intent classifier v1"
          className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="template" className="mb-1 block text-sm">
          Template (must include <code>{"{{input}}"}</code>)
        </label>
        <textarea
          id="template"
          name="template"
          required
          rows={6}
          placeholder={
            "Classify this customer message as one of: refund, shipping, other.\nReply with the label only.\n\nMessage: {{input}}"
          }
          className="w-full rounded border border-gray-600 bg-transparent px-3 py-2 font-mono text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-white px-4 py-2 text-black disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save prompt"}
      </button>
      {state.error && <p className="text-red-400">{state.error}</p>}
      {state.success && <p className="text-green-400">{state.success}</p>}
    </form>
  );
}
