## Why

Admins can see cash register shift history, but they cannot inspect which sales belong to a specific register. Closing totals need a drill-down view to audit the shift.

## What Changes

- Add admin cash register detail route.
- Show cash register summary and observations.
- Show sales linked to the register with status, payment method, total, and ticket links.
- Link cash register history rows to the detail route.

## Impact

- Affected specs: `reports-analytics`, `api-surface`.
- Affected files: `app/admin/cajas`, `lib/cash`, OpenSpec artifacts.

