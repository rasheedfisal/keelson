---
name: dotnet-modular
description: Adds .NET features as one deployable modular monolith. Use when creating a module, minimal API, handler, or cross-module call, or when a boundary, a shared project, or a second service is being considered. Persistence follows the ef-core or dapper skill.
---

# .NET modular monolith

One deployable. Modules are the boundaries. A module leaves the process only when an ADR says it must.

Learned from a working .NET modular-monolith practice: hide internals, publish a contract, own the schema, and make a boundary violation fail the build.

## When this shape fits

- The codebase is large enough that tangled modules slow delivery.
- A team needs to own a business capability without operating a distributed system.

## When to leave it alone

- The system is already microservices. Do not wrap that in this layout.
- The application is small. Boundaries that nothing crosses are ceremony. Stop and ask before adding them.

## Layout

Each module separates API, application, domain, and infrastructure. The host project is the single deployable.

- Callers reference the module's public contract: application commands and queries, integration events, or an explicit facade.
- Callers do not reference another module's domain, infrastructure, or `DbContext`.
- Language visibility and project references hide the implementation. A public type is a contract. Everything else stays internal.
- Shared code is listed in an ADR. If it is not on that list, it does not get a shared project.

## Data

Each module owns its schema. Another module does not read or write those tables. If it needs the data, it calls the contract, or it reads a view the owner published for that purpose.

- Aggregate writes follow the `ef-core` skill. Complex reads follow the `dapper` skill.
- A transaction stays inside one module unless an ADR describes the cross-module case.

## Enforce

A dependency check fails the build when a project references another module's implementation. Do not allow the reference and plan to fix it later.

## Workflow

1. Read `apps/api/AGENTS.md` and `docs/architecture/overview.md`.
2. Name the business capability before creating projects. That capability is the module.
3. If the boundary or the shared-code rule is new, write an ADR in `docs/decisions/` and stop until it is accepted.
4. Implement through the existing Result, validation, and Minimal API conventions.
5. Keep schema migrations in the module that owns the tables. The `ef-core` skill applies them before any data change.

## Stop and ask

Stop before a second deployable, before a module reads another module's tables, before a new shared project, and before an exception to the dependency check.
