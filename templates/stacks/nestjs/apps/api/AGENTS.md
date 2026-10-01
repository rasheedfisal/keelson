# Backend

- pnpm workspace. This file covers `apps/api` and, when a queue exists, `apps/worker`. The Next.js app is `apps/web`; the `nextjs` skill owns it.
- Shared Zod contracts live in `packages/shared`. Drizzle schema and migrations live in `packages/database`.
- Apps depend on packages with `workspace:*`. Packages do not depend on apps.
- A feature is a Nest module. Controllers stay thin. Another feature imports the public module, not an internal service.
- A feature owns its tables. Another feature calls that module or a published contract. A cross-feature reference stores the id.
- The web app uses shared contracts or the HTTP API. It does not import Nest providers or the database client.
- Schema changes follow the `drizzle` skill. The schema package is `packages/database`.
- Work that must survive a restart goes to `apps/worker`.
- A new package needs two apps that share it, or an ADR.

Detailed backend notes stay in `docs/architecture/overview.md`.
