---
name: migration-inventory
description: Catalogs a legacy system's screens, endpoints, jobs, integrations, roles, and tables from the code and database. Use during migration phase 1, before behavior capture or any target implementation.
---

# Migration inventory

Output: `docs/migration/01-inventory.md`

## Workflow

1. Read the legacy code and, when a database is reachable with a read-only user, the live schema.
2. List screens, endpoints, background jobs, integrations, roles, config, and scheduled tasks.
3. List every table with an approximate row count.
4. Mark each item keep, change, drop, or unknown.

## Stop and ask

Do not decide silently. Stop and ask before marking an item drop, and do not start behavior capture until the user approves the inventory.
