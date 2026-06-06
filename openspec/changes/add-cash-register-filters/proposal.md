## Why

The admin cash register page shows recent registers only. Admins need to filter by period, status, and operator for daily audits and follow-up.

## What Changes

- Add date range, status, and operator filters to `/admin/cajas`.
- Preserve filters when opening a cash register detail and returning.
- Keep report-origin return paths compatible with the new filters.

## Impact

- Affected specs: `api-surface`, `reports-analytics`.
- Affected files: `app/admin/cajas`, `lib/cash`, OpenSpec artifacts.
