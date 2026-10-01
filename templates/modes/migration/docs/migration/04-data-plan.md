# Data plan

Field-level mapping and the rules for the load. Do not write migration scripts until the user approves this document.

## Profile

Row counts, nulls, duplicates, orphans, and values that fail the transform.

## Field mapping

| Target column | Source | Transform | Nullable | Decision |
| --- | --- | --- | --- | --- |

## Strategies

IDs, soft deletes, timestamps, money, secrets, load order, batch size, and the legacy identifier a failed batch resumes from. The legacy identifier is a unique key on the target.

## Checkpoint

Target keys copied aside before a load that can overwrite or delete. The live table stays in place.

## Quarantine

| Legacy id | Source table | Reason | Source fields |
| --- | --- | --- | --- |

## Reconciliation

`legacy count = migrated + quarantined + intentionally dropped`

Money columns match on sum. A sample of rows matches on `legacy_id`. The down path is the checkpoint restore, or the reverse transform when one exists.
