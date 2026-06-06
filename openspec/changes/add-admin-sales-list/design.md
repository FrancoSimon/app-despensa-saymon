## Context

Counter sales live in `ventas` and `venta_items`. Sale cancellation metadata already exists. The ticket route can display active and canceled sales, but there is no admin index page.

## Decisions

1. Use a server-rendered `/admin/ventas` page.
   - Rationale: the page is mostly a query and table, and admin auth already fits server rendering.

2. Use `estado` query param filters.
   - Rationale: this matches the admin wholesale order filter pattern.

3. Link to the existing ticket route.
   - Rationale: the ticket page remains the detail view and print/share surface.

## Non-Goals

- Bulk export of sales.
- Editing sales.
- A separate full sale detail page beyond the ticket.

