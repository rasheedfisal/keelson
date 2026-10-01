---
name: postgres
description: Reviews PostgreSQL indexes, query shape, plans, and transactions. Use when a query is slow, a table grows, or the task involves EXPLAIN, locking, JSONB access, pagination, or migration SQL. Column types and schema files belong to the ORM skill.
---

# PostgreSQL

The database is PostgreSQL. An ORM writes the schema. This skill checks that the SQL will stay fast.

Read `docs/architecture/database.md` and the current migrations before changing a table or a hot query.

## Indexes

PostgreSQL does not index a foreign key column. Add that index with the key.

Index the columns a query filters, joins, or sorts. A composite index puts equality columns first, then the range or sort column. It serves the leading columns. It does not serve a later column alone.

A partial index covers a selective predicate. A covering index includes the columns a hot query returns when that query is narrow. B-tree is the default. JSONB containment and arrays use GIN. BRIN fits a large append-only column whose values follow physical row order.

Each extra index slows writes. Confirm an index is used with `EXPLAIN (ANALYZE, BUFFERS)` before treating it as required. Confirm with a person before dropping an index.

A random uuid primary key scatters inserts across the B-tree. When the ORM skill uses uuid, a time-ordered id keeps that index healthier on a large table. The column type itself stays with the ORM skill.

## Queries

Select the columns the caller uses. Join instead of a subquery that runs once per row. A loop that issues one query per id becomes one query with `ANY` or `IN`.

Keep predicates sargable: compare the indexed column to a range, and leave functions off that column. Bound a list with `LIMIT`. A deep page uses a keyset (`WHERE (sort_col, id) < (...)`) on an index that matches that order. `UNION ALL` is enough when the branches cannot overlap.

## Schema changes that ship

A column is not renamed or dropped in place. Old and new code can run in the same window, so both must be valid after each deploy.

1. Expand. Add the new column or table, nullable, beside the old one.
2. Dual-write, then backfill existing rows in batches.
3. Switch reads. Keep writing the old column until that deploy has baked.
4. Contract. Stop writing the old column. Drop it in a later migration, after nothing reads it.

An add can ship with the code that starts filling it. A drop ships alone. Each migration has a down path that has been run. A large index is built so writes keep going (`CREATE INDEX CONCURRENTLY` when the server allows it). Copying rows out of a legacy database follows the `data-migration` skill.

## Transactions

Keep a transaction short and set the isolation it needs. The default is `READ COMMITTED`. `REPEATABLE READ` and `SERIALIZABLE` need a retry when Postgres reports a serialization failure. A transaction left open, including `idle in transaction`, stops vacuum from cleaning dead tuples.

## Stop and ask

Stop before a destructive migration, a lock-heavy rewrite, dropping a column that still holds data, or dropping an index.
