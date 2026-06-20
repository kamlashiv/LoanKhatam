---
name: Loan-tracker link/icon button a11y conventions
description: Patterns reviewers enforce on loan-tracker for styled-link buttons and icon-only controls
---

Two conventions repeatedly flagged in code review on the loan-tracker web app:

- **Styled link buttons:** use `<Button asChild><Link href=...>label</Link></Button>`,
  never `<Link><Button>...</Button></Link>`. The shadcn `Button` uses Radix `Slot`,
  so className/aria-label forward onto the `Link`'s `<a>`. The nested form produces
  invalid `<a><button>` markup.
- **Icon-only controls need an accessible name:** any button whose only child is a
  lucide icon (back arrow, Trash2 delete, Menu toggle, X close) must have an
  `aria-label`. Inputs should have a `<Label htmlFor>` or an `aria-label`.

**Why:** both were rejection causes in review (invalid nested interactive elements;
missing screen-reader names). **How to apply:** whenever adding a Link-as-button or
an icon-only button anywhere in artifacts/loan-tracker, apply these up front.
