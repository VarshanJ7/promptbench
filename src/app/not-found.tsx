import Link from "next/link";
import { buttonClasses, EmptyState } from "@/components/ui";

// Shown for unknown URLs and for notFound() (e.g. a run id that doesn't exist).
export default function NotFound() {
  return (
    <main className="pt-6 sm:pt-12">
      <EmptyState
        icon={<span className="font-mono text-xs">404</span>}
        title="Page not found"
        description="This page doesn't exist, or the run it points to was deleted."
        action={
          <>
            <Link href="/results" className={buttonClasses("secondary")}>
              All results
            </Link>
            <Link href="/" className={buttonClasses("ghost")}>
              Home
            </Link>
          </>
        }
        className="py-16"
      />
    </main>
  );
}
