---
name: drizzle
description: Writes Drizzle schemas and queries for PostgreSQL. Use when adding or changing pgTable definitions, columns, foreign keys, indexes, joins, inferred types, or db.select queries, and when generating a migration from that schema. Where the schema package lives belongs to the stack skill. Query plans belong to the postgres skill.
---

# Drizzle

Inspect the installed Drizzle version and follow that API. Style below is the default. `find-me` locates the schema files the project already uses.

## Schema

- Table names are plural snake_case. Column names are snake_case. A new table uses the same noun family as its neighbors.
- Primary keys are a single text or uuid column, generated in the application or by `defaultRandom()`. A caller may still pass an id.
- Uniqueness that is not the primary key is a `uniqueIndex`. A new table does not get a composite primary key, and it does not use `serial` or `bigserial`.
- Foreign keys name `onDelete`.
- Timestamps are `timestamptz`. Spread the project's existing timestamp helper when it has one.
- A missing value is null. A product state is `text` with `$type`, not `pgEnum`, unless the value set is immutable.
- JSONB uses a named type. A column ships with the code that writes it.

## Queries

Use `db.select()`, `insert`, and `update`. Joins are explicit.

The relational API (`db.query`, `findFirst`, `findMany`, `with`) is not the default. It hides the join.

Prefer the query builder. Expression-level `sql` is for a cast, a JSON path, or `CASE`. A recursive CTE may stay raw SQL, with schema columns interpolated and a narrow row type. A heavy query then follows the `postgres` skill.

## Migrations

1. Change the schema TypeScript.
2. Generate a migration.
3. Read the SQL. Mark destructive steps. A rename or a drop is not this migration. Follow the `postgres` skill: add the new shape, backfill, then drop in a later migration.
4. Apply the migration in development.
5. Verify the columns, constraints, and indexes in PostgreSQL.

`db push` is not this path.

## Done

The generated SQL matches the schema change, and a destructive statement was confirmed before it ran.
