## Why

The current-account module needs a per-customer detail view to be operationally complete. Admins can see balances and register payments, but they still need a complete account ledger to audit debt, payments, current balance, and related receipts.

## What Changes

- Add a per-customer current-account detail page.
- Show customer data, balance summary, and chronological ledger with running balance.
- Link sale movements to sale tickets and payment movements to payment receipts.
- Allow registering partial or full payments from the detail page.

## Impact

- Affected specs: api-surface, data-model
- Affected code: account queries, admin current-account list, account detail route, payment receipt navigation
