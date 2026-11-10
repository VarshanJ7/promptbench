import "server-only";
import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Shared-password gate. Anyone can view pages; only people who entered
// APP_PASSWORD can do anything that writes data or spends API credit.
//
// The cookie holds an HMAC of a fixed string, keyed by the password. It proves
// the password was entered without storing the password, and changing
// APP_PASSWORD automatically logs everyone out.

export const AUTH_COOKIE = "pb_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// "open"         - no APP_PASSWORD, local development: everything allowed
// "unlocked"     - password set and this browser entered it
// "locked"       - password set, this browser hasn't entered it
// "unconfigured" - production without APP_PASSWORD: all writes refused
export type AuthState = "open" | "unlocked" | "locked" | "unconfigured";

export const LOCKED_MESSAGE =
  "Locked: enter the app password on the Unlock page (top right) first.";

function password(): string | undefined {
  return process.env.APP_PASSWORD || undefined;
}

function sessionToken(pw: string): string {
  return createHmac("sha256", pw).update("promptbench-session-v1").digest("hex");
}

// Constant-time comparison of two strings of any length.
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function getAuthState(): Promise<AuthState> {
  const pw = password();
  if (!pw) {
    return process.env.NODE_ENV === "production" ? "unconfigured" : "open";
  }
  const cookie = (await cookies()).get(AUTH_COOKIE)?.value;
  return cookie && safeEqual(cookie, sessionToken(pw)) ? "unlocked" : "locked";
}

// Call at the top of every Server Action that writes or spends credit.
export async function canWrite(): Promise<boolean> {
  const state = await getAuthState();
  return state === "open" || state === "unlocked";
}

export function isCorrectPassword(input: string): boolean {
  const pw = password();
  return Boolean(pw) && safeEqual(input, pw!);
}

export async function setAuthCookie(): Promise<void> {
  const pw = password();
  if (!pw) return;
  (await cookies()).set(AUTH_COOKIE, sessionToken(pw), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAuthCookie(): Promise<void> {
  (await cookies()).delete(AUTH_COOKIE);
}
