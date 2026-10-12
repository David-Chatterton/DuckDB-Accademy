# DuckDB Academy v0.1

A local, browser-based SQL learning application for an Excel-experienced beginner. Module 1 contains eight lessons using fictional financial data. Modules 2–8 are a clearly labelled roadmap.

## Run locally

Install Node.js **22.13+ within the 22 series, or Node.js 24+**, and npm, then run in this directory:

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal. This is a Vite / React / strict TypeScript application using Tailwind CSS, DuckDB-Wasm, Monaco, Recharts and React Flow. No backend, login or real bank data is required. Once installed and served, the core lesson workspace loads its DuckDB and Monaco assets from the application itself, without CDN dependencies. External documentation links need internet access.

If Node is managed with `fnm`, initialise its shell environment before running npm. A Node runtime was found at `/home/david/.local/share/fnm/node-versions/v26.11.1/installation/bin/node` during implementation, although `node` and `npm` were absent from the agent's PATH.

## Checks and production build

```sh
npm run check:core
npm run test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview
```

`test` runs Vitest unit tests and real DuckDB-Wasm SQL integration tests under Node. `test:e2e` starts Vite and exercises real browser DuckDB, all eight solutions, error recovery, alternate queries, persistence, reset, terminal simulation, seed download and mobile navigation. Browser installation needs network access. `build` type-checks before creating `dist/`. Deploy the contents of `dist/` through a static HTTP host with correct JavaScript and WebAssembly MIME types; do not open `index.html` using `file://`.

## What is implemented

- Eight structured Module 1 lessons with objectives, beginner explanations, Excel equivalents, syntax breakdowns, tasks, editable queries, hints, solutions and solution explanations.
- DuckDB-Wasm running in a worker, seeded on initialisation, with real results and SQL errors, cancellation on reset, initialisation/query timeouts and resource disposal.
- Module 1 SELECT-only workflow, external access disabled, configuration locked and learner transactions rolled back.
- Monaco SQL editor, plain-text accessible alternative, Run Query, Ctrl/Command+Enter, copy and reset controls, paginated results with column types.
- Interactive teaching samples for column selection, row filtering, ranges, AND/OR, sorting and unique values. Samples are explicitly distinguished from actual query results.
- Guided terminal simulation plus native CachyOS instructions and an identical downloadable SQL seed.
- Independent learning progress storage, dashboard, monthly spending chart with an accessible table, draggable schema diagram, responsive navigation and system/light/dark themes.

See verification status below for checks completed and the remaining browser verification.

## Database

A fixed linear congruential random generator (seed `20260101`) produces exactly 10,000 transactions from 1 January 2024 to 31 December 2025. JavaScript generation uses integer pence; SQL storage uses **DECIMAL(12,2)**. Negative amounts are outflows; positive amounts are inflows. Currency is GBP. Savings transfers and credit card repayments have two matching opposite entries sharing a `transfer_id`; they are not spending or income when analysing across your own accounts.

| Table | Purpose |
| --- | --- |
| `accounts` | Current accounts, savings and credit card; primary key `id` |
| `categories` | Twelve spending/income categories; primary key `id` |
| `payees` | Canonical payees with a default category relationship |
| `transactions` | Date, relationship IDs, original payee/category text, exact amount and cleaning markers |
| `budgets` | Monthly category allocations using exact decimal amounts |

Transactions retain payee/category text to let beginners query without joins. IDs prepare the curriculum for relational modelling. Controlled whitespace/case variants, duplicated business records (with different primary keys), missing categories and paired transfers prepare later cleaning lessons. The generated activity volume and anomalies are intentionally educational; this is not a model household's recommended spending.

Database state is recreated deterministically on reload or Reset database. Progress is saved independently in `localStorage` under `duckdb-academy:progress:v1`. Reset learning progress changes only that key; it never clears unrelated storage or theme preferences. Completion means a successful checked query, including a revealed solution that the learner subsequently runs.

## Native CLI practice

Download `training.sql` using the app's SQL seed control, or generate it:

```sh
npm run seed
duckdb academy.duckdb < training.sql
duckdb academy.duckdb
```

Use a fresh database. The seed is wrapped in a transaction and intentionally does not drop existing tables. Browser and CLI use the same schema and generator, rather than two independent datasets. Check `pacman -Si duckdb` on CachyOS before installing; the app links official package and installation documentation. The simulated terminal runs SQL in browser DuckDB and never executes host shell commands.

## Add lessons

Add a lesson object to `src/content/lessons.ts` conforming to `Lesson` in `src/types.ts`. Define the objectives, explanation, visual type, task, starter, reference solution, hints, expected ordering and any required technique. The reference query executes against the same actual database to establish expected results. Add acceptance and rejection cases and extend browser coverage. Module 1 currently assumes eight lessons in its navigation/reporting; see ARCHITECTURE.md for changes needed when adding later modules.

## Verification status in the implementation environment

- **Passed on the installed dependency tree:** strict TypeScript checking and the Vite production build; ESLint; 30 tests across six Vitest files; and the core smoke check. The 11 real WASM integration tests execute all eight reference lessons and alternative answers, check exact decimal/date decoding, reject incorrect boundaries, recover after errors, and reset/reseed from the native SQL download. The installed engine identifies itself as DuckDB v1.4.3.
- **Updated test tooling verified:** build, lint and all 30 tests also pass with installed Vitest 4.1.11 and ESLint 10.12.0. A fresh `npm audit` result is still needed; no clean audit is claimed.
- **Browser QA:** the laptop Chromium run passed four of five tests, including all eight reference solutions, persistence, alternate queries, terminal simulation, downloads and responsive navigation. The remaining test used an ambiguous alert locator that also matched Monaco accessibility alerts. The query error now has an accessible name and the test targets that name. Rerun `npm run test:e2e` on the laptop to verify the fix. The sandbox still cannot start Vite (`listen EPERM 127.0.0.1:5173`).
- **esbuild is working:** the production build passed despite npm's pending-install-script warning. No install-script approval was needed for that build.
- **Git remains blocked:** the supplied `.git` directory is protected/read-only and not a valid repository. No Git metadata was removed or replaced; no commit or remote change was made.
- No deployment was requested or performed. The user-generated package-lock.json is preserved and the updated tooling is installed.

The application source and real SQL engine have passed the checks above. The final browser test rerun and fresh dependency audit remain outstanding before calling v0.1 fully verified.

The targeted tooling updates were selected from locally cached npm registry metadata. Relevant advisories: [Vitest mocker path traversal](https://github.com/advisories/GHSA-82fw-gwwq-j7x9), [tinypool worker options](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3), [tinypool run options](https://github.com/advisories/GHSA-85c8-ppgw-ccpr). This project uses those packages for development tests; they are not dependencies of the production application.
