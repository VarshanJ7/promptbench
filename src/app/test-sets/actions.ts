"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { canWrite, LOCKED_MESSAGE } from "@/lib/auth";
import { MAX_UPLOAD_BYTES } from "@/lib/limits";
import { prisma } from "@/lib/prisma";

export type UploadState = { error?: string; success?: string };

const MAX_ROWS = 500;

export async function uploadTestSet(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  if (!(await canWrite())) return { error: LOCKED_MESSAGE };

  const name = String(formData.get("name") ?? "").trim();
  const file = formData.get("file");

  if (!name) return { error: "Please enter a name for the test set." };
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a CSV file." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: `File is too large (max ${MAX_UPLOAD_BYTES / 1_000_000} MB).` };
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const fields = parsed.meta.fields ?? [];
  if (!fields.includes("input") || !fields.includes("expected")) {
    return { error: 'CSV must have the columns "input" and "expected".' };
  }

  const rows = parsed.data
    .map((r) => ({
      input: (r.input ?? "").trim(),
      expected: (r.expected ?? "").trim(),
    }))
    .filter((r) => r.input && r.expected);

  if (rows.length === 0) return { error: "No valid rows found in the CSV." };
  if (rows.length > MAX_ROWS) {
    return { error: `Too many rows (max ${MAX_ROWS}).` };
  }

  await prisma.testSet.create({
    data: { name, cases: { create: rows } },
  });

  revalidatePath("/test-sets");
  return { success: `Saved "${name}" with ${rows.length} test cases.` };
}
