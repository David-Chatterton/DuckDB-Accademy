# Curriculum

The learner knows Excel and finance, but is not assumed to know SQL. Lessons explain each new keyword, show an Excel/Power Query connection, demonstrate the logical operation and require a query against real fictional data. All UI and teaching copy use British English.

## Module 1 — implemented in source

| Lesson | Task | Key teaching point |
| --- | --- | --- |
| 1. Understanding tables and SELECT | Retrieve all transactions | Rows, columns, types, SELECT *, FROM, statement endings |
| 2. Selecting specific columns | Show date, payee, amount | Projection changes columns, not row count |
| 3. WHERE | Grocery purchases exceeding £30 | Exact text, AND, negative outflow sign |
| 4. Comparison operators | Purchases £50–£100 inclusive | Reversed negative bounds; >=, <= and BETWEEN |
| 5. AND / OR | Groceries over £30 or restaurants over £50 | Two branches, parentheses and precedence |
| 6. ORDER BY and LIMIT | Ten largest classified outflows excluding transfers | Ascending negative amounts; stable ties on id |
| 7. DISTINCT | Unique categories including NULL | Deduplication applies to the selected row; missing is not zero |
| 8. Independent investigation | Outflows over £1,000 excluding Housing and Transfers | Translate a financial question into a complete query |

Each lesson defines prerequisites, objectives, plain-English explanations, Excel equivalents, syntax, visualisation, editable starter, actual-result validation, three progressive hints, a requested solution reveal, solution reasoning, CLI practice and completion criteria. Scaffolding decreases towards the final investigation. Prerequisites are recommendations; learners can revisit any lesson.

A strictly exceeding boundary excludes equality. Range endpoints in lesson 4 are included. Lesson 6 excludes missing categories as well as Transfers; this is stated explicitly. Lesson 7 includes a single NULL entry. Lesson 8 includes three controlled unusual purchases and does not use LIMIT. The fictional activity volume supports varied exercises; anomalous spending is an investigation signal, not evidence of wrongdoing.

## Planned modules — no active lesson links

2. **Aggregation and financial analysis:** SUM, COUNT, AVG, MIN, MAX, GROUP BY, HAVING, CASE.
3. **Relational data:** keys, relationships, INNER/LEFT JOIN, NULL and referential integrity.
4. **Importing and cleaning data:** CSV, Parquet, types, casting, dates, text, duplicates, standardisation.
5. **Database management:** CREATE TABLE, INSERT, UPDATE, DELETE, views, constraints, transactions.
6. **Advanced analytical SQL:** CTEs, subqueries, window functions, balances, rolling averages, PIVOT.
7. **DuckDB CLI and Python:** native terminal, files, import/export, pandas, scripts, automation.
8. **Accounting laboratory:** reconciliation, categorisation, internal transfers, double-entry, budgets, reporting.

Introduce mutable isolated databases before implementing Modules 4–5. Validate each new lesson with positive examples, subtly incorrect results and equivalent SQL answers. Verify browser/native data parity after any schema or generator change.
