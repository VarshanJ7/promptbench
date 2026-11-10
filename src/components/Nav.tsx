import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { NavLinks, NavLinksStatic } from "./NavLinks";

export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#5b5bd6" />
      {/* three bars of different heights: a tiny benchmark chart */}
      <rect x="6" y="12" width="2.6" height="6" rx="1" fill="white" fillOpacity="0.55" />
      <rect x="10.7" y="8" width="2.6" height="10" rx="1" fill="white" fillOpacity="0.8" />
      <rect x="15.4" y="5" width="2.6" height="13" rx="1" fill="white" />
    </svg>
  );
}

// Top bar. On wide screens: brand · links · auth on one row. On phones the
// links move to a second, horizontally scrollable row.
export function Nav({ auth }: { auth: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="flex h-14 items-center gap-2 text-sm font-semibold tracking-tight text-fg"
        >
          <LogoMark />
          PromptBench
        </Link>

        <div className="order-last -mx-4 w-[calc(100%+2rem)] overflow-x-auto border-t border-line px-4 py-2 sm:order-none sm:mx-0 sm:w-auto sm:flex-1 sm:overflow-visible sm:border-0 sm:p-0">
          <Suspense fallback={<NavLinksStatic />}>
            <NavLinks />
          </Suspense>
        </div>

        <div className="ml-auto flex h-14 items-center text-sm sm:ml-0">{auth}</div>
      </nav>
    </header>
  );
}
