---
name: verify
description: Checks that a change satisfies the requirement in the running product, beyond a green test suite. Use when a feature, migration, or bugfix is claimed done and needs a real walkthrough.
---

# Verify

A green test is not the same as a satisfied requirement.

## Workflow

1. Restate the requirement in one sentence.
2. Exercise the real path a user or operator takes.
3. Check empty, error, and edge states the requirement implies.
4. For data changes, compare counts and sampled records against the source of truth.
5. Write down what was verified and what was not.

## Stop and ask

Do not declare the work done while a requirement has not been exercised. Stop and ask if the requirement is too vague to verify.
