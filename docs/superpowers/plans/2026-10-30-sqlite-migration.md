# Migração SQLite incremental Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir persistência JSON por SQLite local sem quebrar contratos atuais do app.

**Architecture:** `src/lib/db.ts` continua sendo a fachada pública. Um módulo SQLite inicializa schema, importa `data/db.json` uma vez e converte registros entre tabelas e `Db`. `DB_DRIVER=json|sqlite` controla backend durante transição.

**Tech Stack:** Next.js 16.4.3, TypeScript 5, Node `v24.22.1`, `node:sqlite`, SQLite, ESLint.

**Spec:** `docs/superpowers/specs/2026-10-30-sqlite-migration-design.md`

## Global Constraints

- Preserve `getDb`, `saveDb` e `mutateDb`.
- Keep `data/db.json` intact during migration.
- Create `data/app.sqlite` only when SQLite backend is selected.
- Keep SQL inside persistence modules.
- Do not change routes, components, or business behavior unless required by type errors.
- Run `npm run lint` and `npm run build` after migration.

## Review Focus

- Empty SQLite file must import JSON exactly once, without duplicating rows on restart. Test in Task 2.
- Missing or malformed JSON must not silently delete an existing SQLite database. Test in Task 2.
- Concurrent mutations must commit atomically and preserve both changes. Test in Task 3.
- Optional fields and JSON-shaped settings must survive round-trip conversion. Test in Task 2.
- `DB_DRIVER=json` must retain existing behavior and avoid creating SQLite files. Test in Task 4.

---

### Task 1: Add backend configuration and SQLite module boundary

**Files:**
- Create: `src/lib/sqlite.ts`
- Modify: `src/lib/db.ts`
- Modify: `.env.example`
- Test: `src/lib/sqlite.test.ts`

**Interfaces:**
- Produces `openSqliteDb(): SqliteStore`, `initializeSqlite(store): void`, `importJsonIfEmpty(store, raw: Db): void`.
- `src/lib/db.ts` remains the only import used by routes and components.

- [ ] **Step 1: Write failing tests** for schema initialization, table creation, and configuration selection.
- [ ] **Step 2: Run `npm test` or the configured test command** and verify failure because SQLite module is absent.
- [ ] **Step 3: Implement SQLite connection and schema initialization** in `src/lib/sqlite.ts` using `node:sqlite`; enable foreign keys and create tables for settings, categories, products, orders, order items, users, messages, and delivery zones.
- [ ] **Step 4: Add `DB_DRIVER=json|sqlite` documentation** to `.env.example`; default to `json` until activation task.
- [ ] **Step 5: Run focused tests** and verify schema creation succeeds.
- [ ] **Step 6: Commit** with `feat: add sqlite persistence boundary`.

### Task 2: Implement JSON import and SQLite round-trip

**Files:**
- Modify: `src/lib/sqlite.ts`
- Modify: `src/lib/types.ts` only if SQLite driver types require a local type
- Test: `src/lib/sqlite.test.ts`

**Interfaces:**
- `readSqliteDb(store): Db` returns normalized-equivalent data.
- `writeSqliteDb(store, db: Db): void` replaces persisted state in one transaction.
- `importJsonIfEmpty(store, db: Db): void` imports only when SQLite has no application rows.

- [ ] **Step 1: Write failing round-trip tests** asserting settings, optional product fields, order items, users, messages, and delivery zones survive write/read.
- [ ] **Step 2: Add test for first-run import** asserting one import and no duplicate rows after a second initialization.
- [ ] **Step 3: Add test for malformed/missing source behavior** asserting existing SQLite data remains untouched.
- [ ] **Step 4: Implement row mapping and transactional import/write/read.** Store settings and nested hours as JSON fields; normalize output through existing `normalizeDb`.
- [ ] **Step 5: Run focused tests** and verify all round-trip and import tests pass.
- [ ] **Step 6: Commit** with `feat: import and round-trip app data in sqlite`.

### Task 3: Switch `db.ts` to SQLite while preserving mutation locking

**Files:**
- Modify: `src/lib/db.ts`
- Modify: `src/lib/sqlite.ts`
- Test: `src/lib/db.test.ts`

**Interfaces:**
- `getDb(): Promise<Db>` selects backend using `DB_DRIVER`.
- `saveDb(db: Db): Promise<void>` persists through selected backend.
- `mutateDb<T>(fn: (db: Db) => T | Promise<T>): Promise<T>` remains atomic.

- [ ] **Step 1: Write failing backend-selection tests** for JSON mode, SQLite mode, and SQLite first-run import.
- [ ] **Step 2: Write failing mutation test** with two updates and assert both survive.
- [ ] **Step 3: Implement SQLite selection and initialization** without changing public function signatures.
- [ ] **Step 4: Keep `withWriteLock` around SQLite mutations** and wrap SQLite replacement writes in database transactions.
- [ ] **Step 5: Run focused tests** using isolated temporary data paths.
- [ ] **Step 6: Commit** with `feat: route database facade through sqlite`.

### Task 4: Activate SQLite safely and document rollback

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `CONTEXTOapp1.md`
- Create: `scripts/migrate-json-to-sqlite.mjs`
- Test: `scripts/migrate-json-to-sqlite.test.mjs` if test runner supports it

**Interfaces:**
- Migration script creates a timestamped JSON backup, initializes SQLite, imports current JSON, and reports row counts.
- Rollback is `DB_DRIVER=json`; SQLite file remains available for inspection.

- [ ] **Step 1: Write migration script checks** for backup creation, import counts, and idempotent rerun.
- [ ] **Step 2: Implement script using the same schema/import functions** rather than duplicating SQL.
- [ ] **Step 3: Document activation and rollback commands** in README and project context.
- [ ] **Step 4: Run migration against a temporary copy** and verify counts match JSON.
- [ ] **Step 5: Activate `DB_DRIVER=sqlite` only after validation** in local environment, without committing `.env.local`.
- [ ] **Step 6: Commit** with `docs: document sqlite migration and rollback`.

### Task 5: Full verification and manual smoke check

**Files:**
- Modify: none unless verification finds a defect

- [ ] **Step 1: Run `npm run lint`.** Expected: exit code 0.
- [ ] **Step 2: Run `npm run build`.** Expected: optimized production build completes with exit code 0.
- [ ] **Step 3: Start app with SQLite backend** and check public menu, admin login, product list, orders list, kitchen, delivery, tracking, and chat routes.
- [ ] **Step 4: Confirm `data/app.sqlite` exists and JSON backup remains.**
- [ ] **Step 5: Run JSON fallback smoke check** and confirm no SQLite file is created by fallback-only startup.
- [ ] **Step 6: Commit any verification fix separately.**

## Execution Order

Run Tasks 1–3 sequentially because each task defines interfaces for the next. Run Task 4 after round-trip tests pass. Run Task 5 last.

## Self-review

- Spec coverage: backend boundary, import, fallback, transaction, backup, documentation, and verification map to Tasks 1–5.
- Type consistency: all persistence functions return or accept existing `Db`; facade signatures remain unchanged.
- Risk coverage: first-run import, malformed source, optional fields, concurrent mutation, and fallback appear in Review Focus with owning tests.
- Proportion: plan defines interfaces and checks without prescribing implementation bodies beyond schema and transaction requirements.
