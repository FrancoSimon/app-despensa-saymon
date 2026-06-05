## Context

Counter sales are stored in `ventas` and `venta_items`. The confirmation action already returns the sale id, so the UI can link to a durable ticket route.

## Decisions

1. Use a print-optimized HTML ticket page.
   - Rationale: the browser print dialog supports paper printing and "Save as PDF" without adding client PDF libraries.

2. Fetch ticket details from Supabase by sale id.
   - Rationale: tickets remain available after refresh and reflect stored sale snapshots.

3. Reuse existing RLS.
   - Rationale: admins can read all sales, sellers can read their own sales through current policies.

## Non-Goals

- Fiscal invoice generation.
- Electronic invoicing.
- Custom native PDF rendering.
