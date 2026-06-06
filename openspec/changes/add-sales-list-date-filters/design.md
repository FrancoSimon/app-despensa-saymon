## Context

Reports use `ReportDateRange` from `lib/reports/dates`. The sales list already supports status filters and ticket return paths. Reusing the same date range helper keeps date behavior consistent.

## Decisions

1. Use `desde` and `hasta` query params.
   - Rationale: this matches the reports page.

2. Use the existing report date range helper.
   - Rationale: avoids duplicating date normalization and Argentina day boundaries.

3. Keep ticket return paths as internal relative URLs.
   - Rationale: the existing ticket safety check accepts `/admin/ventas...` only.

## Non-Goals

- Pagination.
- CSV export.
- Date filtering for POS seller view.

