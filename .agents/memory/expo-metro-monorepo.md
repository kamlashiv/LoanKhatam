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

## Heavy web-only deps in the workspace root can crash Metro's watcher

Because `watchFolders` includes the workspace root, Metro's `FallbackWatcher` (used when watchman is absent) crawls and watches the entire root `node_modules`, including packages only the web artifact uses. Two failure modes:

1. **Transient crash during installs:** adding a big web-only package (e.g. `pdfjs-dist`, `tesseract.js`) creates pnpm temp dirs like `pdfjs-dist_tmp_NNNN`. Metro can try to `watch` one mid-install; after pnpm deletes it, the cached file-map still references it and Metro crashes with `ENOENT ... watch '.../pkg_tmp_NNNN'` (exit 7). The temp path persists in the **metro-file-map cache**, so it recurs on restart even though the dir is gone.

**Fix:** (a) add the web-only packages to `config.resolver.blockList` so Metro never crawls/watches them, and (b) clear stale Metro caches once (`rm -rf $TMPDIR/metro-* $TMPDIR/haste-map-* /tmp/metro-* /tmp/haste-map-* artifacts/<name>/node_modules/.cache`) then restart. blockList accepts a RegExp or array; merge with any existing default:

```js
const ignoredWebPackages = [
  /\/node_modules\/\.pnpm\/pdfjs-dist@[^/]+\//,
  /\/node_modules\/\.pnpm\/tesseract\.js[^/]*@[^/]+\//,
];
config.resolver.blockList = config.resolver.blockList
  ? [].concat(config.resolver.blockList, ignoredWebPackages)
  : ignoredWebPackages;
```

**Why:** the mobile app never imports these, so blocking them is safe and also speeds up bundling. **How to apply:** whenever a heavy web-only dep is added to the monorepo and the Expo workflow starts failing with an `ENOENT watch` on a `_tmp_` path, block it and clear the cache.
