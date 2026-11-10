"use client";

import { useActionState } from "react";
import { Alert, Button, Field, Input, Spinner } from "@/components/ui";
import { unlock, type UnlockState } from "./actions";

const initialState: UnlockState = {};

export default function UnlockForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(unlock, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <Field label="App password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
        />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Spinner />}
        {pending ? "Checking..." : "Unlock"}
      </Button>
      {state.error && <Alert tone="error">{state.error}</Alert>}
    </form>
  );
}
