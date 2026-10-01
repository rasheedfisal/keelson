---
name: architecture
description: Chooses how a change fits the modular monolith, module boundaries, and stack recorded for this repository. Use when adding a module, changing boundaries, selecting libraries, or deciding where logic lives.
---

# Architecture

Decide how the change fits the existing system before implementing it.

## Workflow

1. Read `docs/architecture/overview.md`, `docs/decisions/`, and the nearest `AGENTS.md`.
2. Follow `find-me` before adding a module, package, or project.
3. Name the module boundary. Business logic stays inside that boundary, as the stack skill defines it, not in controllers, route handlers, or UI components.
4. Follow `grill-me` when the boundary, a new library, or a new service is not already recorded. Wait for confirmation.
5. Record the accepted decision in `docs/decisions/` using `docs/decisions/_template.md`.

## Done

The decision is in `docs/decisions/`, and the change has the one owner `find-me` named.
