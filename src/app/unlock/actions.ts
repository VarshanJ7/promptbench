"use server";

import { redirect } from "next/navigation";
import {
  clearAuthCookie,
  isCorrectPassword,
  setAuthCookie,
} from "@/lib/auth";

export type UnlockState = { error?: string };

// Only allow redirects to paths on this site ("/runs"), never "//evil.com".
function safeNext(value: FormDataEntryValue | null): string {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/runs";
}

export async function unlock(
  _prev: UnlockState,
  formData: FormData
): Promise<UnlockState> {
  if (!process.env.APP_PASSWORD) {
    return { error: "APP_PASSWORD is not set on the server, so there is nothing to unlock." };
  }

  const password = String(formData.get("password") ?? "");
  if (!isCorrectPassword(password)) {
    // Slow down guessing a little.
    await new Promise((r) => setTimeout(r, 1000));
    return { error: "Wrong password." };
  }

  await setAuthCookie();
  redirect(safeNext(formData.get("next")));
}

export async function lock(): Promise<void> {
  await clearAuthCookie();
  redirect("/");
}
