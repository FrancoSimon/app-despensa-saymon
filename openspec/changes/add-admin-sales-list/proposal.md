## Why

Admins can see sale totals and canceled sale counts, but there is no operational list to inspect individual counter sales or quickly open canceled tickets. This makes it hard to audit canceled counter sales.

## What Changes

- Add an admin counter sales list route.
- Allow filtering by active, canceled, or all sales.
- Show date, seller, payment method, total, status, and cancellation reason.
- Link each sale to its internal ticket.
- Link the admin dashboard and canceled sale report count to the list.

## Impact

- Affected specs: `pos-sales`, `reports-analytics`, `api-surface`.
- Affected files: `app/admin/ventas`, `app/admin/page.tsx`, `app/admin/reportes/page.tsx`, `lib/sales`, OpenSpec artifacts.

