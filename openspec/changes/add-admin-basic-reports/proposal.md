## Why

Admins need a quick operational view of daily sales, best sellers, low stock, and wholesale order status. The current dashboard has placeholders but no report page.

## What Changes

- Add `/admin/reportes`.
- Show today's counter sales total and sale count.
- Show sales grouped by day for the selected range.
- Show best-selling products for the selected range.
- Show low-stock products and wholesale order counts by status.
- Add CSV export for the best-sellers table.
- Link the admin dashboard "Reportes" card to the new page.

## Capabilities

### Modified Capabilities

- `reports-analytics`: Implement basic admin report indicators, grouped sales, best sellers, and CSV export.
- `api-surface`: Add an admin reports route.

## Impact

- Affected files: `app/admin/reportes`, `app/admin/page.tsx`, `components/reports`, `lib/reports`, OpenSpec artifacts.
