---
name: Deleting an artifact
description: How to fully delete an artifact (its workflow is artifact-managed and resists removeWorkflow)
---

To delete an artifact, remove its directory: `rm -rf artifacts/<slug>`, then run `pnpm install` to update the lockfile (workspace globs `artifacts/*`).

**Why:** An artifact's workflow is artifact-managed. Calling `removeWorkflow({name})` on it fails with `PROHIBITED_ACTION` ("managed by an artifact and cannot be deleted via deleteRunWorkflow"). Deleting the artifact directory auto-deregisters the artifact AND removes its managed workflow — the platform emits a "Removed artifact: <Title>" update.

**How to apply:** Do NOT try removeWorkflow first for artifact workflows. Just `rm -rf` the dir + `pnpm install`. Artifact frames/iframes on the canvas are system-managed and can't be deleted via canvas actions; they resolve on their own once the artifact is gone.
