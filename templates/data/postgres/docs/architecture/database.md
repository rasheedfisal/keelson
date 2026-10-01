# Database

PostgreSQL is the system of record.

## Rules

- Schema changes go through migrations.
- Foreign keys and constraints express invariants.
- Read `EXPLAIN` before shipping a new heavy query.
- Money is `numeric` or integer minor units, never floating point.

## Tables

Document tables here as they are added.
