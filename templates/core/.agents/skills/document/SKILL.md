---
name: document
description: Updates docs and decision records so they match the code after a change. Use when architecture, schema, API behavior, or a recorded decision changed.
---

# Document

Keep one source of truth. Link to it instead of copying it.

## Workflow

1. If a decision changed, add or update a file in `docs/decisions/`.
2. Update the architecture, database, or feature doc that owns the topic.
3. Leave `AGENTS.md` as an index. Put the detail in `docs/`.
4. Remove statements that the code no longer follows.

## Stop and ask

Do not invent a decision the user has not made. Stop and ask, then record the answer.
