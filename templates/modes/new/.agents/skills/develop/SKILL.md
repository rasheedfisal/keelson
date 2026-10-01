---
name: develop
description: Implements an agreed feature after scope and architecture are settled. Use when the user asks to build a feature, endpoint, page, or module and the stack is already chosen.
---

# Develop

Implement only what scope and architecture already allow.

## Workflow

1. Read the feature note and `AGENTS.md`. Follow `find-me` before creating a module, package, or document.
2. Follow the stack skill for the files you touch: `nextjs`, `nestjs-modular` or `dotnet-modular`, `postgres`, and the ORM skill.
3. Reuse existing Result, validation, logging, and API response types.
4. Add tests for the behavior. Then run the project's typecheck, lint, and tests.
5. Hand off to `verify` and `review` before calling the work complete.

## Stop and ask

Do not decide silently. Stop and ask when a required decision is missing from `docs/decisions/` or the feature note.
