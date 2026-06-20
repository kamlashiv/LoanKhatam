---
name: Boundary-safe dark: variant injection
description: How dark mode was added to loan-tracker without breaking light styling
---

Loan-tracker dark mode is purely additive: a `.dark` token block in index.css plus `dark:` Tailwind variants on every hardcoded color. Light output stays byte-identical because nothing light was removed.

**Bulk technique:** apply `dark:` variants to many slate tokens with perl using boundary lookarounds so variant-prefixed and substring tokens are untouched:
`s/(?<![:\w-])text-slate-900(?![\w-])/text-slate-900 dark:text-slate-100/g`
Run `hover:` tokens as their own separate rules. The `(?<![:\w-])` guard prevents double-prefixing already-`dark:`/`hover:` tokens.

**Why:** running an overlapping rule set twice produced duplicate `dark:text-emerald-300 dark:text-emerald-300`. After any perl pass, grep for adjacent duplicate dark variants and collapse them.

**Charts:** recharts props (CartesianGrid stroke, XAxis/YAxis tick fill, Pie stroke) are not CSS classes, so `dark:` can't reach them. Pass theme-aware JS values from `useTheme().isDark` instead. The shared `ChartTooltip` in lib/chart-theme.tsx is already a fixed dark panel — fine in both modes.

**Intentionally left light-only:** gradient banners (white text + `bg-white/20` dividers on indigo→emerald) read fine on both themes; don't add dark variants there.
