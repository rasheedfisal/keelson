# Backend

- One deployable. Each module separates API, application, domain, and infrastructure.
- Callers use a module's public contract. They do not reference its domain, infrastructure, or `DbContext`.
- Each module owns its schema. Another module does not query those tables.
- Handlers stay thin. Business rules stay in the domain and application layers.
- Aggregate writes follow the `ef-core` skill. Complex reads follow the `dapper` skill.
- A forbidden project reference fails the build.
- Shared projects exist only when an ADR lists them.

Detailed backend notes stay in `docs/architecture/overview.md`.
