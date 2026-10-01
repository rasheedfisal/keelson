---
name: dapper
description: Writes parameterized PostgreSQL queries with Dapper for read models and reporting. Use when a .NET module needs SQL that EF Core should not shape, including aggregates, exports, and performance-sensitive reads.
---

# Dapper

Use Dapper for complex reads. Keep writes of aggregates on EF Core unless the module already uses Dapper for that write.

## Rules

- Parameterize every value. Do not concatenate SQL.
- Map rows to an explicit type.
- Share the transaction and connection lifetime of the use case.
- Keep the SQL in the module that owns the read model.

## Stop and ask

Do not decide silently. Stop and ask before duplicating an aggregate write that EF Core already persists.
