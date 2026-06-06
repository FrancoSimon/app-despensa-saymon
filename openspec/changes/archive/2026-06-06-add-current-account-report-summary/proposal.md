## Why

Admins need current-account totals in the reports panel without changing cash-register closing behavior. Current-account sales are debt movements, while payments are separate account movements.

## What Changes

- Add a current-account summary block to `/admin/reportes`.
- Show units sold on account, amount sold on account, payments registered in the period, and pending current-account debt.
- Keep cash-register summaries independent from current-account debt reporting.

## Impact

- Affected specs: reports-analytics
- Affected code: report queries, report types, admin reports page
