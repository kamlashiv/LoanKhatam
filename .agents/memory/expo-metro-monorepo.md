---
name: Expo monorepo Metro config
description: How to configure metro.config.js so Metro can resolve packages installed in the artifact's own node_modules in a pnpm workspace.
---

In a pnpm monorepo, packages installed in an artifact's `dependencies` (not `devDependencies`) end up in `artifacts/<name>/node_modules/`, not the workspace root. Metro's default config only looks at the workspace root.

**The rule:** Set `watchFolders` to include workspace root, and `nodeModulesPaths` to check the artifact's own `node_modules` first, then the workspace root's.

**How to apply:** Use this pattern in `artifacts/<name>/metro.config.js`:

```js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
```

**Why:** Without this, Metro throws "Unable to resolve X" even when X is installed in the artifact's node_modules. The symptom is an "Unable to resolve" error for a package that clearly appears in `ls artifacts/<name>/node_modules/`.

**Do NOT set** `config.resolver.disableHierarchicalLookup = true` — this prevents Metro from finding its own internal packages (like `@expo/metro-runtime`) and breaks bundling entirely.
