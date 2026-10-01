---
name: migration
description: Migrates an existing application to the target architecture, including its data, through gated documents. Use when the user mentions migration, a rewrite, moving off a legacy stack, or porting an old Next.js, Kotlin, .NET, or PHP system. Do not write target code before the inventory, mapping, and data plan are approved.
---

# Migration

The legacy system's behavior is the source of truth, not its folder structure. Never start by converting files.

## Ground rules

- Each phase writes a document in `docs/migration/`. Do not start the next phase until the user approves the current document.
- Never modify the legacy system or its database. Treat both as read-only.
- Every divergence from legacy behavior is a decision. Record it in `docs/decisions/` and ask the user.
- If the legacy behavior is unclear, list an open question. Do not guess.
- Money, balances, permissions, and personal data get the strictest checks.

## How the old system leaves

The replacement covers the critical behavior in `docs/migration/02-behavior.md` before any legacy path is removed. A quirk users can observe is behavior. Replicate it, or record the divergence in `docs/decisions/`.

Old and new run together. One module moves at a time, and only after parity for that module. The legacy system stays until that old path has no users. Removing it is its own step after cutover.

Advisory is the default: the old path stays until the user sets a removal date. A hard deadline is a user decision, and the migration steps for it already exist.

A caller keeps a stable interface while the implementation behind it changes. That interface belongs to the stack skill. A feature flag switches one slice when that slice's cutover is risky, and the flag is written into `docs/migration/07-cutover.md`.

A column change on the new database follows the `postgres` skill. Moving legacy rows follows the `data-migration` skill.

## Phases

1. Inventory (`migration-inventory`) → `docs/migration/01-inventory.md`
2. Behavior capture → `docs/migration/02-behavior.md`
3. Target mapping (`migration-mapping`) → `docs/migration/03-mapping.md`
4. Data plan (`data-migration`) → `docs/migration/04-data-plan.md`
5. Incremental build, one module at a time, only after phases 1–4 are approved → `docs/migration/05-incremental-build.md`
6. Parity (`migration-parity`) → `docs/migration/06-parity.md`
7. Cutover (`migration-cutover`) → `docs/migration/07-cutover.md`

## Stop and ask

Stop and ask before starting each phase, before any behavior change, before any destructive data operation, and before any run against data that is not local.
