---
name: ef-core
description: Persists aggregates with EF Core on PostgreSQL without hiding the SQL. Use when changing tracked entities, relationships, or EF migrations in a .NET module. Use the dapper skill for heavy read models.
---

# EF Core

EF Core is not a reason to ignore PostgreSQL.

## Rules

- Do not expose `DbContext` to API handlers.
- Do not call `Include` by default. Load the graph the use case needs.
- Use `AsNoTracking` for read-only queries.
- Inspect generated SQL for queries with several joins.
- Do not accept an N+1 query as the design.

## Workflow

1. Change the model and add an EF migration through the project's normal path.
2. Read the migration SQL. A rename or a drop follows the `postgres` skill: add the new shape, backfill, then drop in a later migration.
3. Add PostgreSQL indexes for the new predicates.
4. Confirm the module owns this `DbContext`.

## Stop and ask

Do not decide silently. Stop and ask before a migration that drops data or before using EF change tracking to load a large batch.
