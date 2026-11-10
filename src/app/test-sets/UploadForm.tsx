"use client";

import { useActionState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  FileInput,
  Input,
  Spinner,
} from "@/components/ui";
import { uploadTestSet, type UploadState } from "./actions";

const initialState: UploadState = {};

export default function UploadForm() {
  const [state, formAction, pending] = useActionState(
    uploadTestSet,
    initialState
  );

  return (
    <Card>
      <CardHeader
        title="Upload a test set"
        description="One row per test case."
      />
      <CardBody>
        <form action={formAction} className="space-y-5">
          <Field label="Test set name" htmlFor="name">
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Shopee support messages"
            />
          </Field>
          <Field
            label="CSV file (columns: input, expected)"
            htmlFor="file"
            hint={
              <>
                Header row must include{" "}
                <code className="font-mono text-fg-muted">input</code> and{" "}
                <code className="font-mono text-fg-muted">expected</code>.
              </>
            }
          >
            <FileInput id="file" name="file" accept=".csv" required />
          </Field>
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending && <Spinner />}
            {pending ? "Uploading..." : "Upload"}
          </Button>
          {state.error && <Alert tone="error">{state.error}</Alert>}
          {state.success && <Alert tone="success">{state.success}</Alert>}
        </form>
      </CardBody>
    </Card>
  );
}
