"use client";

import { useActionState } from "react";
import { uploadTestSet, type UploadState } from "./actions";

const initialState: UploadState = {};

export default function UploadForm() {
  const [state, formAction, pending] = useActionState(
    uploadTestSet,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 max-w-md space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm">
          Test set name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Shopee support messages"
          className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="file" className="mb-1 block text-sm">
          CSV file (columns: input, expected)
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".csv"
          required
          className="block w-full text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-white px-4 py-2 text-black disabled:opacity-50"
      >
        {pending ? "Uploading..." : "Upload"}
      </button>
      {state.error && <p className="text-red-400">{state.error}</p>}
      {state.success && <p className="text-green-400">{state.success}</p>}
    </form>
  );
}
