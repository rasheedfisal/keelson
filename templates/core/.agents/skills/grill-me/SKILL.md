---
name: grill-me
description: Interviews the user about a plan until every open decision is settled. Use when the user says "grill me", or when scope or architecture reaches a decision that is not already recorded in docs.
---

# Grill me

A decision is the user's. A fact is looked up in the repo, the docs, or the tool output.

## Workflow

1. List the decisions as a tree. A question whose answer depends on another open question waits.
2. Ask the questions that are ready now. Number each one and give a recommended answer.
3. Wait. Recompute the tree from the answers. Ask the next ready set.
4. Stop when no decision is left assumed, then ask the user to confirm the shared understanding.

## Done

The user has confirmed. Implementation waits until that confirmation. Record the result with the `scope` or `architecture` skill, whichever owns the decision.
