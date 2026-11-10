import Link from "next/link";
import { Badge, buttonClasses } from "@/components/ui";
import { getAuthState } from "@/lib/auth";
import { lock } from "./unlock/actions";

function LockIcon({ open = false }: { open?: boolean }) {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d={open ? "M5.5 7V5a2.5 2.5 0 0 1 4.9-.7" : "M5.5 7V5a2.5 2.5 0 0 1 5 0v2"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Shown in the nav. Reads the cookie, so it must render inside <Suspense>.
export default async function AuthStatus() {
  const state = await getAuthState();

  if (state === "open") {
    return (
      <Badge tone="neutral" dot>
        Dev mode<span className="hidden sm:inline"> · no password</span>
      </Badge>
    );
  }
  if (state === "unconfigured") {
    return (
      <Badge tone="warning" dot title="APP_PASSWORD not set">
        Read-only<span className="hidden sm:inline"> · APP_PASSWORD not set</span>
      </Badge>
    );
  }
  if (state === "unlocked") {
    return (
      <form action={lock} className="flex items-center gap-2">
        <Badge tone="success" dot>
          Unlocked
        </Badge>
        <button type="submit" className={buttonClasses("ghost", "sm")}>
          <LockIcon />
          Lock
        </button>
      </form>
    );
  }
  return (
    <Link href="/unlock" className={buttonClasses("secondary", "sm")}>
      <LockIcon />
      Unlock
    </Link>
  );
}
