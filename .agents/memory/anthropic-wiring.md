---
name: Anthropic AI integration wiring
description: Steps required to wire the Anthropic AI integration into this monorepo's api-server artifact.
---

When adding the Anthropic AI integration to this project, these steps are ALL required (not optional):

1. `setupReplitAIIntegrations({ providerSlug: "anthropic", ... })` — provisions env vars automatically
2. `cp -r .local/skills/ai-integrations-anthropic/templates/lib/* lib/` — copies the integration package and DB schema files
3. Add `{ "path": "./lib/integrations-anthropic-ai" }` to root `tsconfig.json` references
4. Add `{ "path": "../../lib/integrations-anthropic-ai" }` to `artifacts/api-server/tsconfig.json` references
5. Add `"@workspace/integrations-anthropic-ai": "workspace:*"` to `artifacts/api-server/package.json` dependencies
6. Export conversations and messages from `lib/db/src/schema/index.ts` (do NOT overwrite the file, append)
7. `pnpm install --no-frozen-lockfile`
8. `pnpm --filter @workspace/db run push` — creates the conversations and messages tables

**Why:** The template skill copies files but does not wire them up; all tsconfig references, package.json deps, and DB barrel exports must be done manually or the build will fail with missing module errors.

**How to apply:** Follow this checklist in order any time `@workspace/integrations-anthropic-ai` is added to a new artifact.
