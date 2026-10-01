---
name: review
description: Reviews a change for architecture, security, data, API contracts, and tests before it is called complete. Use when a feature is implemented, before a migration phase advances, or when the user asks for a production review.
---

# Review

Review as if you did not write the change.

## Checklist

- Architecture and module boundaries match `docs/architecture/overview.md`
- Authorization is enforced on the server
- Input is validated and errors use the project convention
- Logs are structured and do not include secrets
- Schema changes have a migration; queries that need indexes have them
- Transactions cover writes that must succeed or fail together
- API responses match the existing contract
- Tests cover behavior, and the requirement was verified
- UI changes include loading, empty, and error states, and follow the `product-ui` skill

## Stop and ask

Do not approve a change that fails a checklist item by calling it a follow-up. Stop and ask the user which items may wait.
