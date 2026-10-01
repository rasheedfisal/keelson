---
name: find-me
description: Finds the existing module, package, skill, or document that already owns a change so a second home is not created. Use when adding a file, module, package, skill, screen, or document, or when the user says "find me" where this belongs.
---

# Find me

One owner per concern. Search before creating.

## Workflow

1. Name the concern in the words the repo already uses.
2. Search modules, packages, skills, and docs for that owner.
3. One owner: change it.
4. No owner: the stack skill names where a new one is created.
5. Two owners: stop. Ask which one is canonical, then record that with the `architecture` skill.

## Done

The change has one owner, and the path to it is named.
