# Project

Stack: {{STACK_LABEL}}.
Keelson mode: {{MODE}}.

Installer manifest: `.keelson.json`.

## General rules

- Follow the existing architecture before introducing a new pattern.
- Prefer an existing abstraction over a duplicate.
- Do not add a dependency when an installed one already solves the problem.
- Keep business logic out of controllers, routes, and UI components.
- Preserve module boundaries.
- Do not change the database schema without a migration and a plan for existing data.
- Run the relevant checks after a change.
- Do not decide architecture, data loss, or security questions silently. Record decisions in `docs/decisions/` and ask.

## Where to read

- Architecture: `docs/architecture/overview.md`
- Database: `docs/architecture/database.md`
- Decisions: `docs/decisions/`
- Frontend: `apps/web/AGENTS.md`
- Backend: `apps/api/AGENTS.md`

## Skills

Skills are in `.agents/skills/` and mirrored in `.cursor/skills/`. Use the skill that matches the task.
