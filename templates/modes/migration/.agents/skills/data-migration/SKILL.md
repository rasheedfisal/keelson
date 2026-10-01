---
name: data-migration
description: Plans moving legacy rows into the new PostgreSQL database and checks that every row is accounted for. Use when migrating data, mapping old columns, remapping IDs, backfilling, reconciling counts, or running a dry run. Use it for migration phases 4 and 5.
---

# Data migration

Correctness is a reconciliation, not a script that exited zero. This skill is the load. A rename or drop of a column the new app already serves follows the `postgres` skill. Behavior parity after the rehearsal follows `migration-parity`.

## Rules

- The legacy database is read-only. Columns are not dropped there.
- Profile real data. Do not trust ORM entities alone.
- The target stores a stable legacy identifier as a unique key. It does not have to be the primary key. The primary key follows the ORM skill.
- A load is idempotent. A rerun inserts a row only when that legacy identifier is absent, or updates it only when the plan says so.
- Copy in batches ordered by that identifier. One batch is one transaction. A single update of a whole table is not the path.
- A transform runs as a set operation inside the batch. A row that fails the cast, the split, or a required value goes to quarantine with its legacy identifier, the source table, the reason, and the source fields needed to retry.
- Every legacy row is migrated, quarantined, or intentionally dropped.
- Dry run is the default. The dry run is the same `SELECT` the load will use, and it writes nothing.
- Load a table after the tables its foreign keys point at. A cross-feature reference stores the id and does not add a foreign key.
- The target change is additive first. A drop ships later, after nothing reads the old shape, and it ships alone.

## One table

Write this into `docs/migration/04-data-plan.md` before any script.

1. Profile the source: row count, nulls on required columns, duplicate natural keys, orphans, and values that fail the transform.
2. Map every target column to a source, a default, or an explicit derivation.
3. Ask the user to decide IDs, soft deletes, timestamps, money, secrets, and load order. Record those decisions in `docs/decisions/`. A soft-deleted row stays unless the plan drops it. A secret is copied only when the user says the stored form is still valid.
4. When the load can overwrite or delete target rows, copy those target keys into a checkpoint table first. The live table stays in place, with its indexes and foreign keys.
5. Dry-run the batch `SELECT`. Then apply:

```sql
INSERT INTO target (/* columns */, legacy_id)
SELECT /* transforms */
FROM legacy
WHERE legacy_id > :last
ORDER BY legacy_id
LIMIT :batch
ON CONFLICT (legacy_id) DO NOTHING;
```

6. Reconcile before the next table: `legacy count = migrated + quarantined + intentionally dropped`. Money columns also match on sum. A sample of rows matches field by field on `legacy_id`. Unapproved orphans are zero.
7. When the check fails, stop. Delete the batch's target rows by `legacy_id`, or restore them from the checkpoint. Do not continue to a child table.
8. Keep the checkpoint until the user accepts the reconciliation. Dropping it is its own step.
9. Leave the legacy rows in place. Removal waits for `migration-cutover`, after the old path has no users.

A down path is written before the load runs. When the transform is reversible, the down is run on a copy first. When it drops information, the down is the checkpoint restore, and the user has already approved the drop.

## Stop and ask

Stop before any script that writes outside a local database, before dropping information, before a batch that is not keyed on the legacy identifier, and whenever reconciliation does not match.
