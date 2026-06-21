---
name: Cards & Auto-Sync mockup
description: Canvas mockup for the credit-card + auto-import feature request, and why it's a mockup not a real integration.
---
User asked (Hinglish) to add all credit cards, auto-fetch loans+cards via Gmail and via mobile number, "sync with all banks", AI selects bank.

**Decision:** Built as a single self-contained mockup component on the canvas (mockup-sandbox), NOT a real integration.
**Why:** Real all-bank sync via phone number requires RBI Account Aggregator (or Plaid-equivalent) licensing; Gmail read access needs Google OAuth verification/security review. Neither is feasible to ship blind, so the honest move is to design the UX first and let the user approve direction.
**How to apply:** If asked to "make it real", route to: (1) Account Aggregator / Plaid for bank data, (2) Gmail API with restricted-scope verification for email parsing, (3) the mockup shows read-only/confirm-before-add framing that any real impl must keep. Mockup file: artifacts/mockup-sandbox/src/components/mockups/cards-autosync/CardsAndSync.tsx. Brand: Ledger indigo-600, Plus Jakarta Sans, ₹ INR, DD/MM/YYYY.
