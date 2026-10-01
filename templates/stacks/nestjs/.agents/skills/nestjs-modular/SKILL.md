---
name: nestjs-modular
description: Adds NestJS features in a pnpm workspace modular monolith. Use when creating a NestJS module, an HTTP endpoint, a background worker, or a shared Zod contract. Pages belong to the nextjs skill. Schema changes belong to the drizzle skill.
---

# NestJS modular monolith

One repository, one pnpm workspace, one PostgreSQL database. Apps are deployable processes. Packages are the boundaries they share. A feature module inside the API is a boundary too.

Leave this shape alone when the API is small and nothing crosses a boundary. Ceremony that nothing enforces is not a module. Stop and ask before adding one.

## Workspace

```text
apps/api            NestJS HTTP API. This skill.
apps/worker         NestJS worker. Add it only when a queue exists.
packages/database   Drizzle schema, client, migrations.
packages/shared     Zod contracts. The seam other apps use.
```

`apps/web` is the Next.js app. The `nextjs` skill owns it. This skill does not create pages. The web app may call this API or import `@scope/shared`. It does not import Nest providers or `@scope/database`.

Root `pnpm-workspace.yaml` includes `apps/*` and `packages/*`. Package names are scoped (`@scope/api`, `@scope/database`, `@scope/shared`). Apps depend on packages with `workspace:*`. Packages do not depend on apps.

A further package (`queue`, `search`, `security`) exists only when at least two apps need it. Otherwise keep the code in the app that uses it.

## Inside the API

A feature is a Nest module folder next to its controller and service, registered from `AppModule`. Match the folders the repository already uses. `application/`, `domain/`, `infrastructure/`, and `presentation/` appear only when those folders already exist.

Controllers stay thin. Rules live in the service or in a package both the API and the worker can call. Services come from Nest dependency injection.

A module exports its public Nest module. Another feature imports that module. It does not import the feature's internal service file. A circular import between modules stops the change.

CQRS waits until the feature already has distinct read and write models, or the user confirms it. Event sourcing waits until an audit trail is a recorded requirement.

## Boundaries

`@scope/shared` holds Zod schemas and the types the API and its callers agree on. It does not import NestJS.

`@scope/database` holds the Drizzle schema, grouped by capability, plus the client. Changing that schema follows the `drizzle` skill. The worker and the API share that database package. They do not open their own schemas.

A feature owns its tables. Another feature does not query them. It calls the owner's public service, or it reads a contract the owner published. A foreign key stays inside one feature. A cross-feature reference stores the id.

Work that must survive a process restart goes to `apps/worker`. An in-memory event stays inside one process and one request.

## Logging

Use the project's structured logger. Redact authorization headers, API keys, and other secrets. Read configuration from the workspace root `.env`.

## Workflow

1. Read `apps/api/AGENTS.md`, `pnpm-workspace.yaml`, and `docs/architecture/overview.md`.
2. Follow `find-me` and match an existing feature module before inventing a package or a new folder layout.
3. Put a new HTTP feature in `apps/api`. Put a new queued job in `apps/worker` and its payload next to the queue package.
4. Change a contract in `@scope/shared` before either app starts using a new shape.
5. When the feature needs a schema change, hand it to the `drizzle` skill before any data change.
6. When the boundary is unrecorded, follow `grill-me` and wait.

## Stop and ask

Stop before adding a package that only one app needs, before the web app imports the database, before a second database, before a cross-feature foreign key, before CQRS, and before splitting a package into its own service.

## Done

The feature is a Nest module with a public export. Its tables are touched only by that feature. Another feature reaches it through that export or the worker.
