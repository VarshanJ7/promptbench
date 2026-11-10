# PromptBench

PromptBench is a small LLM evaluation workbench. You upload a labelled test set,
write a prompt template, and run it against models from OpenAI, Anthropic and
Google Gemini. For every run it records each answer and shows accuracy,
latency and cost side by side, plus the exact cases each model got wrong.

It was built around a real task: classifying Malaysian e-commerce customer
messages (English, Malay and Manglish) into five support categories.

## Screenshots

> _Add screenshots here._
>
> - Results comparison table: `docs/screenshots/results.png`
> - Per-run failed cases: `docs/screenshots/run-detail.png`
> - Run page: `docs/screenshots/runs.png`

## Features

- **Test sets**: upload a CSV with `input,expected` columns (up to 500 rows, 1 MB).
- **Prompts**: templates with an `{{input}}` placeholder.
- **Runs**: pick a test set, a prompt and a model. Calls run 5 at a time.
  One failed API call is recorded as an error and doesn't stop the run.
- **Two scores per run**:
  - **Exact**: the output, trimmed and lowercased, equals the expected label.
  - **Lenient**: the output contains the expected label as a whole word and
    no other label from the test set.
  - The gap between them separates "wrong answer" from "right label, ignored
    the format".
- **Results**: a comparison table per test set, sorted by accuracy then cost,
  and a per-run page that groups failures into *right label, wrong format*,
  *wrong answer* and *API error*.
- **Playground**: send one prompt to one model to check a provider.
- **Deployment safety**: a shared-password gate on every write action, a cap
  on cases per run, a cap on runs per hour, and a cap on output tokens per call.

## Run it locally

Requirements: Node 20+ and a Postgres database (the project uses
[Neon](https://neon.tech)).

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill in the values
npx prisma migrate deploy   # create the tables
npm run dev                 # http://localhost:3000
```

Sample data lives in `sample-data/`:

- `shopee-sample.csv`: 15 rows.
- `shopee-harder.csv`: 50 rows, including slang, typos and ambiguous or
  two-issue messages.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `OPENAI_API_KEY` | no* | Enables OpenAI models |
| `ANTHROPIC_API_KEY` | no* | Enables Claude models |
| `GEMINI_API_KEY` | no* | Enables Gemini models |
| `APP_PASSWORD` | in production | Shared password for writes (see below) |
| `MAX_CASES_PER_RUN` | no | Default `100` |
| `MAX_RUNS_PER_HOUR` | no | Default `10`, counted across all users |
| `MAX_OUTPUT_TOKENS` | no | Default `4096` per call, including thinking tokens |

\* At least one provider key is needed to run anything. If a provider's key
is missing, its models are hidden from the dropdowns instead of failing.

### Re-scoring old runs

`npm run scores:backfill` recomputes lenient scores for every saved result
from the stored outputs. It makes no API calls and is safe to re-run.

## Deploying (Vercel)

1. Import the repo and set the environment variables above. Set
   `APP_PASSWORD` to a strong value.
2. Apply migrations to the production database once with
   `npx prisma migrate deploy`.
3. The Runs page sets `maxDuration = 300`, because a run happens inside one
   Server Action. Larger test sets or slow thinking models can need longer
   than your plan allows. Keep `MAX_CASES_PER_RUN` modest.

**Access model.** Anyone with the URL can *view* test sets, prompts and
results. Uploading, creating prompts, starting runs and using the Playground
need the password.

- Every Server Action re-checks the password itself, as the Next.js docs
  recommend. A hidden button is not treated as protection.
- The password is entered on `/unlock`. It sets an HTTP-only cookie holding an
  HMAC of the password, so changing `APP_PASSWORD` logs everyone out.
- In production with no `APP_PASSWORD`, the app is read-only (it fails closed).

**Worst case per hour.** If the password leaks, the most an attacker can spend
is roughly:

`MAX_RUNS_PER_HOUR × MAX_CASES_PER_RUN × MAX_OUTPUT_TOKENS × output price`

With the defaults on Claude Opus 5.5 ($20 per million output tokens), that is
10 × 100 × 4096 × $20/1M ≈ **$82/hour**. On GPT-4o mini it's about **$2.50/hour**.
Lower the limits, or remove expensive models from `pricing.ts`, if that's too
much. Playground calls are password-gated and length-capped but not counted
toward the hourly limit.

## Architecture

```
Browser ──> Next.js 16 App Router (Server Components + Server Actions)
              │
              ├─ src/lib/auth.ts        password gate (cookie + HMAC)
              ├─ src/lib/limits.ts      per-run / per-hour / size caps
              ├─ src/lib/runner.ts      run engine: concurrency 5, scoring, totals
              ├─ src/lib/scoring.ts     exact + lenient match (pure functions)
              ├─ src/lib/providers/     one interface, three providers
              │    ├─ openai.ts         Chat Completions via fetch
              │    ├─ anthropic.ts      Messages API via fetch
              │    ├─ gemini.ts         generateContent via fetch
              │    └─ pricing.ts        model → provider + $/1M tokens
              └─ src/lib/prisma.ts      Prisma 7 client (@prisma/adapter-pg)
                                              │
                                              v
                                       Neon Postgres
```

- **Next.js 16** with `cacheComponents` enabled. Pages render a static shell
  instantly, and anything that reads the database, cookies or the URL streams
  in behind `<Suspense>`. All writes go through Server Actions.
- **Prisma 7** uses the `prisma-client` generator (output in `generated/prisma`)
  and the `pg` driver adapter.
- **Data model.**
  - `TestSet` has many `TestCase` rows (`input`, `expected`).
  - A `Prompt` holds a `template`.
  - A `Run` is one test set × one prompt × one model, and stores totals:
    `accuracy`, `lenientAccuracy`, `avgLatencyMs` and `totalCostUsd`.
  - A `Result` is one row per test case per run: `output`, `correct`,
    `lenientCorrect`, tokens, latency and cost.
- **Provider layer.** `callModel(model, prompt)` looks up the model's provider
  in the pricing table, calls it with plain `fetch` (no SDKs), and returns
  `{ text, inputTokens, outputTokens, latencyMs, costUsd }`.
  - Output tokens include hidden "thinking" tokens, because providers bill
    them as output.
  - Providers throw on failure. The run engine catches the error per case and
    saves it as an `[error] …` result.
  - Adding a provider means one file plus rows in `pricing.ts`.
- **Benchmark integrity.** No provider-side model fallback is enabled, so a
  run always measures the model it names.

## Pricing data

Prices in `src/lib/providers/pricing.ts` are standard (non-batch) rates per
million tokens. They were checked against each provider's official pricing page
on 2026-11-10:

- [OpenAI](https://developers.openai.com/api/docs/pricing)
- [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing)
- [Google Gemini](https://aistudio.google.com/docs/pricing)

**Unverified prices:** none as of 2026-11-10. Any price that can't be confirmed
on an official page is marked `// UNVERIFIED` in `pricing.ts` and listed here.

Known caveats:

- Google lists a price increase for `gemini-3.8-flash` (to $1.50 / $7.50)
  starting 2027-01-01. Update the row then.
- The Claude Haiku 5.5 rate applies to prompts up to 100K tokens.
- Cached-input discounts aren't modelled, so costs can be slightly
  overstated for long repeated prompts.

## Findings

> _To be filled in with real numbers from real runs. Nothing below is a result yet._

### Setup

- Test set(s):
- Prompt(s):
- Models:
- Date:

### Results

| Test set | Prompt | Model | Exact | Lenient | Avg latency | Cost / run |
|---|---|---|---|---|---|---|
| | | | | | | |

### Observations

- _What separated exact from lenient accuracy?_
- _Which messages did every model get wrong?_
- _Best accuracy per dollar?_
- _Effect of prompt wording on format compliance?_
