"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./ui/cn";

export const NAV_ITEMS = [
  { href: "/test-sets", label: "Test sets" },
  { href: "/prompts", label: "Prompts" },
  { href: "/runs", label: "Runs" },
  { href: "/results", label: "Results" },
  { href: "/playground", label: "Playground" },
];

const itemClass =
  "block shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors duration-150";

export function NavLinks() {
  const pathname = usePathname();
  return <NavList isActive={(href) => pathname === href || pathname.startsWith(href + "/")} />;
}

// Same links with no active state: the Suspense fallback while the pathname
// is unknown during prerendering.
export function NavLinksStatic() {
  return <NavList isActive={() => false} />;
}

function NavList({ isActive }: { isActive: (href: string) => boolean }) {
  return (
    <ul className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                itemClass,
                active
                  ? "bg-surface-raised text-fg ring-1 ring-inset ring-line-strong"
                  : "text-fg-muted hover:bg-surface-raised/60 hover:text-fg"
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
