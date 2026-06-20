---
name: localStorage persisted index validation
description: Why persisted array-index selections (and similar) must be validated as in-bounds integers, not just "is a finite number", when restored from localStorage.
---

# Persisted indices need bounds + integer validation, not just JSON.parse + finite-number checks

When persisting user state to localStorage and restoring it, a `try/catch` around `JSON.parse` plus a "is it a finite number" check is **not** enough resilience for values used as **array indices** (e.g. a selected-option index like `targetSel` in the bento-planner). A parseable-but-invalid value such as `-1` or `0.5` passes a finite-number check, then `options[idx].label` dereferences `undefined` at render and crashes the whole app.

**Why:** "resilient to corrupt stored data" includes corrupt-but-valid-JSON payloads, not just unparseable strings. An architect review will (correctly) flag this as a blocking resilience gap.

**How to apply:** for any persisted value used as an array index, validate `Number.isInteger(v) && v >= 0` in the loader, AND keep a render-time guard that also checks `< options.length` (the options list can shrink at runtime, e.g. when tenure changes). Belt-and-suspenders: harden both the loader and the usage site. Validate enum-like strings against the known key set, and numbers against their real domain (non-negative, integer where required) rather than just `typeof === "number"`.
