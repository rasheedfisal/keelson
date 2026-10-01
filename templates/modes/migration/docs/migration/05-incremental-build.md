# Incremental build

Build one mapped module at a time, in the order from `03-mapping.md`.

For each module: implement, test, dry-run its data load, reconcile, then ask before the next module. Leave that module's legacy path in place until its parity passes. Removal waits for cutover.

Do not start this phase until `04-data-plan.md` is approved.
