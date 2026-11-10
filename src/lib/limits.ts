import "server-only";
import { prisma } from "@/lib/prisma";

// Spending guards, so a leaked password or URL can't drain API credit.
// Each can be overridden with an env var of the same name.

function intEnv(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

// Most test cases a single run may contain.
export const MAX_CASES_PER_RUN = () => intEnv("MAX_CASES_PER_RUN", 100);

// Most runs that may be started in any rolling 60-minute window (all users).
export const MAX_RUNS_PER_HOUR = () => intEnv("MAX_RUNS_PER_HOUR", 10);

// Longest prompt template / playground prompt, in characters.
export const MAX_PROMPT_CHARS = 4000;

// Biggest CSV upload, in bytes.
export const MAX_UPLOAD_BYTES = 1_000_000;

// Returns an error message if the hourly run limit is reached, else null.
// Counted from the Run table, so it works across serverless instances.
export async function runQuotaError(): Promise<string | null> {
  const limit = MAX_RUNS_PER_HOUR();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.run.count({ where: { createdAt: { gte: since } } });
  if (recent < limit) return null;

  const oldest = await prisma.run.findFirst({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  const minutes = oldest
    ? Math.max(1, Math.ceil((oldest.createdAt.getTime() + 3_600_000 - Date.now()) / 60_000))
    : 60;
  return `Hourly limit reached (${limit} runs per hour). Try again in about ${minutes} min.`;
}
