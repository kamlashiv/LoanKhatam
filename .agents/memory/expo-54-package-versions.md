---
name: Expo 54 package versions
description: Compatible peer package versions for expo@~54 in this project.
---

When installing packages for expo@~54, `pnpm add` without a version constraint picks the latest npm version which is often incompatible. Expo logs a warning: "The following packages should be updated for best compatibility".

**Required pinned versions for expo@~54:**
- `expo-secure-store`: `~15.0.8`
- `expo-auth-session`: `~7.0.11`

**Why:** expo@54 has a fixed peer dependency matrix. Installing unpinned versions (e.g. expo-secure-store@56.x) causes runtime incompatibilities even if the bundle loads.

**How to apply:** Always pin versions when adding expo companion packages:
```
pnpm --filter @workspace/ledger-mobile add expo-secure-store@~15.0.8 expo-auth-session@~7.0.11
```

Check `npx expo install --check` or the Expo SDK changelog for the correct version matrix when upgrading expo itself.
