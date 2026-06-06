## Context

Cash register shifts store closing snapshots and sales now have `caja_id`. The history page shows only aggregate data. The detail page can reuse the existing ticket route as the sale detail surface.

## Decisions

1. Use `/admin/cajas/[id]` as the detail route.
   - Rationale: it follows the admin resource hierarchy.

2. Query sales by `caja_id`.
   - Rationale: this directly audits the source records behind the cash register totals.

3. Link sales to the existing ticket route.
   - Rationale: ticket is already the printable sale detail.

## Non-Goals

- Editing cash register records.
- Reopening closed cash registers.
- Exporting cash register details.

