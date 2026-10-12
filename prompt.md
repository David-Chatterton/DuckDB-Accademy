# Project: DuckDB Academy — Interactive SQL Learning Platform

You are an experienced full-stack developer, educational software designer and SQL instructor.

I want you to create a complete, working interactive learning application in the **current working directory**, using Vite, React and TypeScript.

The application will teach me SQL from absolute beginner level, initially using DuckDB, with a strong emphasis on financial data management, accounting and practical Linux terminal skills.

## 1. About the learner

I am technically confident but have never written SQL before.

My background includes:

- Extensive use of Microsoft Excel for analysis, reporting and financial modelling.
- Some experience with Power Query, pivot tables, Python, pandas, JSON and financial APIs.
- Knowledge of accounting, financial statements, budgets and personal finance.
- Practical Linux administration, Docker, Proxmox, Git and basic software development.
- Use of CachyOS (Arch-based Linux) as my daily operating system.
- Experience hosting applications through Docker and deploying React projects to Vercel.

I previously relied on Excel but now want to develop genuine SQL skills, including working with databases directly through Linux terminals.

**Important:** Do not assume any previous knowledge of SQL syntax, joins, relational modelling or database design.

The application must teach concepts clearly without patronising the learner.

Use British English throughout the user interface and learning materials.

## 2. Project objectives

Build a learning application called **DuckDB Academy**.

The application must offer four complementary learning experiences:

1. **Visual learning:** Interactive data tables, diagrams and graphical explanations of SQL operations.
2. **SQL editor:** A functioning SQL editor where I can write and execute SQL statements against an actual DuckDB database.
3. **Terminal learning:** Instructions for running equivalent queries in the native DuckDB CLI on CachyOS, with a simulated terminal for guided exercises.
4. **Practical challenges:** Progressively harder accounting and financial data exercises, with automated feedback and hints.

The aim is to move from Excel-based thinking to independent database analysis.

This must be a genuinely functional educational application, not a static demonstration.

## 3. Technology requirements

Use:

- Vite
- React
- TypeScript, with strict type checking
- Tailwind CSS
- DuckDB-Wasm (`@duckdb/duckdb-wasm`)
- Monaco Editor for SQL editing
- Recharts for financial visualisations
- React Flow (`@xyflow/react`) where interactive relationship diagrams are appropriate
- Lucide icons
- Vitest for unit tests
- Playwright for end-to-end tests

Use a clean, modular architecture with reusable components, custom hooks and separated business logic.

Use current compatible stable dependencies, checking actual package documentation and APIs rather than assuming older versions still work.

The application must run with:

`npm install`

`npm run dev`

It must also support:

`npm run build`

`npm run test`

`npm run lint`

Do not add a backend unless genuinely necessary. For the initial application, DuckDB should run inside the browser using WebAssembly.

## 4. Design and user experience

Create a sophisticated, professional application inspired by modern data analysis tools and educational coding environments.

Requirements:

- Dark and light mode, respecting system preferences.
- Responsive layout.
- Persistent sidebar showing course modules and lessons.
- Clear progress indicators.
- Dedicated lesson workspace.
- Resizable panels where practical.
- SQL syntax highlighting.
- Clear query results tables.
- Helpful SQL error messages.
- Accessible controls and keyboard navigation.
- Minimal unnecessary animations.
- A consistent design system.

The interface must distinguish between explanation, demonstration, guided practice and independent challenges.

Avoid building a marketing-style landing page at the expense of the educational application.

## 5. Educational structure

Design the application to accommodate these eight modules:

### Module 1 — SQL fundamentals
Tables, data types, SELECT, FROM, WHERE, comparison operators, AND, OR, ORDER BY, LIMIT and DISTINCT.

### Module 2 — Aggregation and financial analysis
SUM, COUNT, AVG, MIN, MAX, GROUP BY, HAVING and CASE.

### Module 3 — Relational data
Keys, relationships, INNER JOIN, LEFT JOIN, NULL and referential integrity.

### Module 4 — Importing and cleaning data
CSV, Parquet, data types, casting, date parsing, text cleaning, duplicates and standardisation.

### Module 5 — Database management
CREATE TABLE, INSERT, UPDATE, DELETE, views, constraints and transactions.

### Module 6 — Advanced analytical SQL
Common table expressions, subqueries, window functions, running balances, rolling averages and PIVOT.

### Module 7 — DuckDB CLI and Python
Terminal commands, database files, imports, exports, pandas integration, Python scripts and automation.

### Module 8 — Accounting laboratory
Bank reconciliation, transaction categorisation, internal transfers, double-entry concepts, budgets and financial reporting.

**Scope requirement:** Fully implement Module 1 first. Show Modules 2–8 in the curriculum roadmap, clearly labelled as planned. Do not create non-functional lesson links or falsely indicate that later modules are complete.

The architecture must allow additional lessons to be introduced as structured content without rewriting the application.

## 6. Implement Module 1 completely

Create eight working lessons:

1. Understanding tables and SELECT — retrieve all transactions.
2. Selecting specific columns — show dates, payees and amounts.
3. WHERE — filter grocery purchases exceeding £30.
4. Comparison operators — identify purchases between £50 and £100.
5. AND / OR — apply multiple conditions.
6. ORDER BY and LIMIT — find the ten largest purchases.
7. DISTINCT — identify unique transaction categories.
8. Independent challenge — investigate unusually large transactions.

Every lesson must contain:

- Learning objectives.
- Plain-English explanation.
- Excel or Power Query equivalent.
- Relevant graphical demonstration.
- SQL syntax explanation.
- Editable starter query.
- Working Run Query control.
- Actual DuckDB query results.
- Automated challenge validation.
- Progressive hints.
- Complete solution revealed on request.
- Explanation of why the solution works.
- Equivalent DuckDB CLI instructions.
- Ability to retry and reset.
- Saved completion state.

Use progressively less scaffolding as lessons advance.

Ensure examples are appropriate for someone who has never written SQL before.

## 7. Financial database and synthetic data

Create a realistic fictional personal finance dataset covering approximately 24 months.

Include around 10,000 transactions representing:

- Current accounts.
- Savings accounts.
- Credit cards.
- Salary payments.
- Mortgage or rent.
- Groceries.
- Utilities.
- Transport.
- Subscriptions.
- Restaurants.
- Entertainment.
- Transfers between accounts.
- Refunds and fees.

Design an extensible relational schema using these core tables:

- accounts
- transactions
- payees
- categories
- budgets

Use appropriate primary keys and relationship fields.

Use DECIMAL for financial amounts, not approximate floating-point values.

Document the monetary sign convention consistently. For example, negative values represent money leaving an account and positive values represent money entering it.

Use deterministic synthetic data generation with a fixed seed so that lessons and tests have reproducible results.

Include controlled examples of inconsistent payee names, duplicates, missing categories and transfers for future data-cleaning lessons.

However, ensure Module 1's exercises use a predictable dataset and have reproducible expected results.

Never require access to actual personal bank statements.

## 8. DuckDB execution engine

Implement genuine SQL execution using DuckDB-Wasm.

Requirements:

- Initialise DuckDB reliably in a browser-compatible Web Worker.
- Handle loading and error states.
- Seed the database on first launch.
- Execute SQL written by the learner.
- Return actual results, column names and data types.
- Display SQL errors without crashing the application.
- Allow the learner to reset the database.
- Prevent lesson exercises from accidentally corrupting the reference dataset.
- Dispose of connections and resources appropriately.
- Keep query execution separate from React presentation components.

Use a safe read-only query workflow for Module 1 exercises. Later write-enabled lessons should use controlled, resettable exercise databases.

Consider browser persistence, but prioritise reliable deterministic reinitialisation. Persist learning progress independently of database state.

## 9. Visual SQL teaching

Provide interactive visual explanations.

For example, when teaching WHERE:

- Display the original transactions table.
- Let the learner apply graphical filters.
- Highlight rows that match the conditions.
- Show the corresponding SQL query.
- Explain each clause.
- Show the resulting table.

For ORDER BY:

- Animate or illustrate how rows change order.
- Explain ascending and descending sorting.
- Show the SQL equivalent.

For SELECT:

- Highlight which columns are retained.
- Explain the difference between SELECT * and explicit column selection.

These visualisations should teach the logical meaning of the query, without pretending to reproduce DuckDB's actual physical query execution.

Prefer meaningful teaching interactions over decorative animation.

## 10. SQL editor and feedback

Use Monaco Editor with SQL syntax highlighting.

Include:

- Run Query button.
- Ctrl+Enter keyboard shortcut.
- Reset Query.
- Show Hint.
- Reveal Solution.
- Copy SQL.
- Results grid.
- Query execution status.

SQL validation must be based primarily on actual query results, rather than string matching.

Different valid SQL queries producing the expected result should normally be accepted.

For exercises that specifically require a particular SQL concept, additionally verify the required technique where feasible.

Compare results using appropriate column schemas, row-order requirements and numeric precision.

Provide useful feedback explaining incorrect results, missing columns or misunderstood conditions.

Do not silently accept incorrect solutions or display fabricated query results.

## 11. Terminal learning

Provide a Terminal tab alongside Visual and SQL views.

The terminal component must clearly differentiate between:

- A guided, simulated terminal.
- Commands intended for the learner's actual CachyOS terminal.

The simulated terminal must never pretend that commands have been executed on the host operating system.

For real-world practice, provide instructions for:

- Installing DuckDB on CachyOS.
- Verifying the installation.
- Creating a database.
- Opening the DuckDB CLI.
- Exploring tables.
- Running SQL queries.
- Importing CSV files.
- Exporting results.

Avoid hard-coding installation claims without verification. Include appropriate checks and alternative installation guidance if necessary.

Provide a way to download or generate a reproducible training database or SQL seed script compatible with native DuckDB, so the learner can run equivalent exercises locally.

Browser SQL exercises and native CLI exercises should use matching schemas and deterministic data.

## 12. Lesson engine and user progress

Implement a structured lesson system.

Each lesson should define:

- ID and title.
- Module.
- Prerequisites.
- Learning objectives.
- Explanatory content.
- Visualisation type.
- Starter SQL.
- Expected result specification.
- Required SQL technique, if any.
- Hints.
- Reference solution.
- Terminal exercise.
- Completion criteria.

Keep lesson content separate from React components.

Store lesson progress in browser storage.

Allow progress to be reset without deleting unrelated browser data.

Show completed lessons, current lesson and next recommended lesson.

Provide a learning dashboard summarising progress and concepts mastered.

## 13. Testing and quality

Implement meaningful tests for:

- Deterministic dataset generation.
- Database initialisation.
- Query execution.
- SQL result validation.
- Correct answer acceptance.
- Incorrect answer rejection.
- Lesson completion and persistence.
- Database reset.
- Error handling.

Create end-to-end tests for key learning journeys.

Ensure the application builds successfully.

Run all relevant tests and fix issues before reporting completion.

Do not claim tests passed unless they actually ran successfully.

## 14. Repository and documentation

Work in the current directory.

First inspect its contents and Git status. Preserve any existing files, configuration or history. Do not delete or overwrite unrelated work.

If the directory is empty, initialise a new Vite + React + TypeScript project there.

If no Git repository exists, initialise one. Do not overwrite an existing repository or change its remote.

Create:

- README.md
- ARCHITECTURE.md
- CURRICULUM.md
- CONTRIBUTING.md
- .gitignore

The README must cover installation, local development, testing, production builds, the database design and how to add further lessons.

Document important architectural decisions, particularly DuckDB-Wasm initialisation, data persistence, query validation and the relationship between browser and CLI learning.

## 15. Implementation approach

Work autonomously and implement the application rather than stopping at a proposal.

Proceed in logical stages:

1. Inspect the current project directory and environment.
2. Establish project structure and dependencies.
3. Implement the DuckDB execution engine.
4. Create the deterministic financial dataset.
5. Build the core interface and SQL editor.
6. Implement the lesson engine.
7. Complete all eight Module 1 lessons.
8. Add the visual demonstrations and terminal learning experience.
9. Implement progress tracking.
10. Add tests and documentation.
11. Run build, lint and tests.
12. Review the interface and correct defects.

Prioritise functionality, correctness and maintainability.

Do not spend excessive effort polishing visuals before the core SQL execution and learning functionality work.

Do not implement placeholder interactions that imply functioning behaviour.

Avoid unnecessary frameworks, authentication services or backend infrastructure.

Make reasonable implementation decisions independently. Only request clarification if an essential decision cannot safely be made.

## 16. Completion report

When implementation is finished, provide:

- A summary of what was implemented.
- The principal architectural decisions.
- What is fully working.
- Any limitations or outstanding work.
- Results of the build and tests.
- Exact commands to run the application.
- Suggested next development milestones.

**Begin by inspecting the current working directory and then implement DuckDB Academy v0.1.**
