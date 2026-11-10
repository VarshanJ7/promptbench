// Recomputes lenient scores for every saved Result and Run from the outputs
// already stored in the database. Makes no model API calls. Safe to re-run.
//
//   npm run scores:backfill
//
// Reads DATABASE_URL from .env via dotenv (the same way prisma.config.ts does).
import "dotenv/config";
import pg from "pg";
import { distinctLabels, isLenientMatch } from "../src/lib/scoring.ts";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  const { rows: runs } = await client.query(
    `SELECT id, "testSetId" FROM "Run" ORDER BY "createdAt"`
  );
  let resultsUpdated = 0;

  for (const run of runs) {
    const { rows: labelRows } = await client.query(
      `SELECT DISTINCT expected FROM "TestCase" WHERE "testSetId" = $1`,
      [run.testSetId]
    );
    const labels = distinctLabels(labelRows.map((r) => r.expected));

    const { rows: results } = await client.query(
      `SELECT r.id, r.output, tc.expected
         FROM "Result" r JOIN "TestCase" tc ON tc.id = r."testCaseId"
        WHERE r."runId" = $1`,
      [run.id]
    );

    await client.query("BEGIN");
    let lenient = 0;
    for (const r of results) {
      const ok = isLenientMatch(r.output, r.expected, labels);
      if (ok) lenient++;
      await client.query(
        `UPDATE "Result" SET "lenientCorrect" = $1 WHERE id = $2`,
        [ok, r.id]
      );
    }
    // Same denominator as the runner: every result row, errors count as wrong.
    const lenientAccuracy = results.length ? lenient / results.length : null;
    await client.query(
      `UPDATE "Run" SET "lenientAccuracy" = $1 WHERE id = $2`,
      [lenientAccuracy, run.id]
    );
    await client.query("COMMIT");

    resultsUpdated += results.length;
    console.log(
      `run ${run.id}: ${lenient}/${results.length} lenient-correct` +
        (lenientAccuracy == null ? "" : ` (${(lenientAccuracy * 100).toFixed(1)}%)`)
    );
  }
  console.log(`Done: ${runs.length} runs, ${resultsUpdated} results rescored.`);
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  throw err;
} finally {
  await client.end();
}
