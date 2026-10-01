---
name: migration-mapping
description: Maps each legacy feature and table onto the target modular monolith and records every divergence as a decision. Use during migration phase 3, after inventory and behavior capture exist.
---

# Migration mapping

Output: `docs/migration/03-mapping.md`

## Workflow

1. Read `docs/migration/01-inventory.md`, `docs/migration/02-behavior.md`, and `docs/architecture/overview.md`.
2. Map each legacy feature to a target module and each legacy table to a target table.
3. Record every divergence in `docs/decisions/`.
4. Order the module build by lowest risk and fewest dependencies first.

## Stop and ask

Do not decide silently. Stop and ask for each divergence, and do not write the data plan until the user approves the mapping.
