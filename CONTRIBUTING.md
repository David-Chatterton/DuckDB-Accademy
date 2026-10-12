# Contributing

Use Node 22.13+ within the 22 series, or Node 24+, and npm. Install dependencies with `npm install`, then run `npm run dev`. Preserve prompt.md and unrelated files. Do not change a Git remote or replace a protected `.git` directory.

Keep deterministic generation and SQL execution outside presentation components. Keep lesson content in structured lesson definitions. Use British English, accessible labels and explicit loading/error feedback. Never fabricate query results or completion state. Monetary values must use integer pence during generation and DECIMAL in DuckDB.

Before submitting changes run:

```sh
npm run check:core
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

The core check is a smoke check, not a replacement for Vitest or browser tests. Adapter lifecycle unit tests use mocked bindings. Node integration tests execute the actual DuckDB-Wasm binary; Playwright verifies its browser worker and the interface. Add tests for meaningful boundary cases, incorrect answer rejection and browser/native consistency when changing educational logic.

Inspect the UI at desktop and mobile sizes, in light and dark themes. Test keyboard navigation, error recovery, reset behaviour and the plain text editor. Do not label modules complete until their lessons actually work. Keep animations minimal and respect reduced motion.

The installed dependency tree passed build, lint and 30 tests. The subsequent patched test-tooling update still needs npm install and repeat validation. Browser verification must run in an environment with Chromium and loopback server access. Preserve and refresh package-lock.json, then commit it from a writable, valid repository; the supplied .git directory is protected. Resolve any browser failures before releasing v0.1 as fully verified.
