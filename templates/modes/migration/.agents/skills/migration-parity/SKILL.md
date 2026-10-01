---
name: migration-parity
description: Compares legacy and target behavior on the same inputs, including row counts, sums, and sampled records. Use during migration phase 6, after a module's data has been loaded in a rehearsal.
---

# Migration parity

Output: `docs/migration/06-parity.md`

## Workflow

1. Freeze the legacy snapshot used for the comparison.
2. Run the same inputs through the legacy behavior and the new behavior.
3. Reconcile row counts, sums, balances, and a sample of records.
4. Classify each mismatch as a bug or as a decision the user already approved.

## Stop and ask

Do not explain a mismatch away. Stop and ask before changing a tolerance, and do not start cutover while parity fails.
