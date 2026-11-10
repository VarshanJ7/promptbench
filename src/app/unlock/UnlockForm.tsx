"use client";

import { useActionState } from "react";
import { unlock, type UnlockState } from "./actions";

const initialState: UnlockState = {};

export default function UnlockForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(unlock, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-sm space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className="mb-1 block text-sm">
          App password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-white px-4 py-2 text-black disabled:opacity-50"
      >
        {pending ? "Checking..." : "Unlock"}
      </button>
      {state.error && <p className="text-red-400">{state.error}</p>}
    </form>
  );
}
