import Link from "next/link";
import { getAuthState } from "@/lib/auth";
import { lock } from "./unlock/actions";

// Shown in the nav. Reads the cookie, so it must render inside <Suspense>.
export default async function AuthStatus() {
  const state = await getAuthState();

  if (state === "open") {
    return <span className="text-gray-500">Dev mode · no password</span>;
  }
  if (state === "unconfigured") {
    return <span className="text-yellow-400">Read-only · APP_PASSWORD not set</span>;
  }
  if (state === "unlocked") {
    return (
      <form action={lock}>
        <button type="submit" className="text-gray-400 underline">
          Unlocked · Lock
        </button>
      </form>
    );
  }
  return (
    <Link href="/unlock" className="underline">
      Unlock
    </Link>
  );
}
