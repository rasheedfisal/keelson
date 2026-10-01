---
name: debug
description: Debugs a defect with one hypothesis at a time and removes failed experiments. Use when a test fails, a behavior is wrong, or a migration reconciliation does not match.
---

# Debug

Treat debugging as a controlled experiment.

## Workflow

1. Reproduce the failure and record the exact observation.
2. Form one hypothesis.
3. Make one change that tests that hypothesis.
4. Run the check that confirms or refutes it.
5. Keep the change only if the hypothesis was confirmed. Revert it if the hypothesis was wrong.

## Stop and ask

Do not stack unrelated fixes. Stop and ask when the failure cannot be reproduced or when two hypotheses remain after a clean experiment.
