---
name: audit
description: Reads an existing repository and documents the conventions it actually follows before changing it. Use when the project already exists, the mode is existing, or the user asks to understand a codebase before editing it.
---

# Audit

Learn the repository before imposing a preferred architecture.

## Workflow

1. Read the entry points, module layout, schema, and tests. Trust the code over old docs when they disagree.
2. Write what the system actually does into `docs/architecture/overview.md` and `docs/architecture/database.md`.
3. List conventions that appear consistently, and list contradictions.
4. Propose a change only inside those constraints.
5. Record a refactor as its own decision if the current structure should change.

## Stop and ask

Do not decide silently. Stop and ask before renaming modules, replacing the ORM, or rewriting a working path to match an ideal layout.
