---
name: migration-cutover
description: Writes the cutover and rollback runbook for a migration. Use during migration phase 7, after parity passes. Produces the runbook and waits. Does not execute cutover.
---

# Migration cutover

Output: `docs/migration/07-cutover.md`

## The runbook must include

- Freeze window and final delta sync
- Smoke tests and what healthy means
- Monitoring during the window
- Rollback trigger conditions and the rollback steps
- The rehearsal counts the operator should expect
- The signal that the old path has zero users
- A separate removal step that runs only after that signal

Switching traffic and deleting the legacy system are different steps. Rolling back the new code does not restore a column that was already dropped. The expand phase in the `postgres` skill is what makes that rollback possible.

## Stop and ask

Do not run cutover steps. Produce the runbook and wait for the user.
