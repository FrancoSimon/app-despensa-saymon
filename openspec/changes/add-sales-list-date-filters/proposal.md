## Why

The admin sales list shows recent sales but does not let admins narrow the list by date. Reports already work by date range, so the sales list should support the same operational filtering and preserve filters when opening tickets.

## What Changes

- Add date range filters to `/admin/ventas`.
- Filter admin sales queries by sale date.
- Preserve status and date filters when opening and returning from tickets.
- Pass report date range into the canceled sales list link.

## Impact

- Affected specs: `pos-sales`, `reports-analytics`.
- Affected files: `app/admin/ventas`, `app/admin/reportes/page.tsx`, `lib/sales`, OpenSpec artifacts.

