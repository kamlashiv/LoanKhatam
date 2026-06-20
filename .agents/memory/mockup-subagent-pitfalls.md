---
name: Mockup DESIGN subagent pitfalls
description: Recurring defects in mockup-sandbox variant components produced by parallel DESIGN subagents, and how to catch them before presenting.
---

# Mockup DESIGN subagent pitfalls

When generating canvas design variants via parallel DESIGN subagents (mockup-sandbox + design-exploration), two defects recur and are NOT caught by the subagents' own self-verification:

1. **Escaped template literals in JSX.** Subagents sometimes emit `style={{ height: \`\${expr}%\` }}` (backslash-escaped backticks/`${`). Babel throws `Expecting Unicode escape sequence \uXXXX` and the iframe shows an error overlay. A `curl` of the preview URL still returns **200** (vite serves the HTML shell; the transform error only surfaces in the workflow log and the rendered overlay). So 200 != renders.
   **How to apply:** after subagents finish, grep the variant dir for `\\\`` / `\\${`, scan the mockup-sandbox workflow log for `vite:react-babel` / Babel SyntaxError, and screenshot each variant. Don't trust HTTP 200 alone.

2. **Inconsistent seed data.** If the shared brief's summary counts contradict the per-loan sample array (e.g. brief says "Active 5 / Paid 1" but the 8-loan list is 4 active + 2 paid + 2 overdue), variants faithfully render the contradiction — aggregate tiles disagree with their own loan list.
   **Why:** subagents copy brief numbers verbatim and also render the array; they don't reconcile.
   **How to apply:** make the brief's summary internally consistent with the loan array before launching, and run an architect `evaluate_task` review across the variant files focused on data-consistency, not just compilation.

**Verification path that works:** restart the mockup-sandbox workflow → grep for escaped literals → screenshot every variant → architect review for data consistency → fix → re-screenshot → `presentArtifact`. Do NOT `suggestDeploy` (mockup sandbox isn't deployable).
