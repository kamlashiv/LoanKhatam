---
name: Canvas reserved frames can be partially missing
description: pending_canvas_frames shape_ids are not guaranteed to all exist at runtime; verify and backfill
---

# Reserved canvas frames may be stale/missing

When a user turn includes a `pending_canvas_frames` block, the listed `shape_id`s are
client-placed Building iframes you should `update` (not recreate). But they are NOT
guaranteed to all exist when your run starts.

A reserved id can be absent and return `SHAPE_NOT_FOUND` on an `applyCanvasActions`
update. The canvas may also hold unrelated leftover frames from prior sessions, so a
guessed id can collide (`VALIDATION_FAILED: already exists`). Never assume all reserved
ids resolve; never reuse a guessed id.

**How to apply:**
- After issuing the `update` batch, check the per-action `results`/`errors`. If a
  reserved id is missing, `getCanvasState({focusArea})` over the intended region to
  see what's actually there.
- For a missing reserved frame, `create` a fresh frame with a NEW unique id at the
  intended rect (from the `pending_canvas_frames` coordinates) so the row stays aligned.
  Do not move/resize the frames that did exist.
- Keep the surviving reserved frames at their client-given positions/sizes — don't
  align/distribute them.
