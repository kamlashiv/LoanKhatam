---
name: Bento planner artifact
description: The standalone Smart Loan Saver (bento-planner) artifact and how it relates to loan-tracker's planner.
---

"Smart Loan Saver" (`artifacts/bento-planner`, slug/previewPath `/bento-planner/`)
is a standalone react-vite artifact graduated from the approved "Bento Dashboard"
planner mockup. It is a single-page default-export App with NO backend/DB/auth.

**Why:** It was split out as its own product surface but reuses loan-tracker's
payoff-planner logic. The amortization/engine/export/file-extract libs were
**copied** into `bento-planner/src/lib/`, not shared via a workspace lib.

**How to apply:** There are now two independent consumers of the same planner
engine (loan-tracker's planner page + bento-planner). If you change planner math,
strategy presets, reverse-calc, or export formats in one, decide whether the other
needs the same change — they will not update automatically. bento-planner has no
wouter routing or persistence (no "Save as Loan"); keep it frontend-only.
