## Context

The app has Supabase Auth, role profiles, protected admin routes, and an admin shell. The next module is product management, using Supabase PostgreSQL as the source of truth.

## Goals / Non-Goals

**Goals:**

- Store products with all MVP product fields required by the SAYMON spec.
- Preserve historical relationships by deactivating products instead of deleting rows.
- Allow admins to manage products from `/admin/productos`.
- Keep seller/wholesale read policies aligned with future POS/B2B modules.

**Non-Goals:**

- Supabase Storage uploads from the UI.
- Bulk price update workflow.
- POS cart or wholesale catalog implementation.

## Decisions

1. Use `numeric(12,2)` for prices.
   - Rationale: exact decimal arithmetic is required for money.

2. Use `activo boolean` for logical deletion.
   - Rationale: sales, orders, and invoices must keep product references intact.

3. Use RLS plus server-side admin authorization.
   - Rationale: RLS protects direct database access; Server Actions still authenticate and authorize before mutation.

4. Use separate create/edit pages rather than a large inline editable table.
   - Rationale: cleaner mobile behavior, less layout shifting, and simpler validation.

## Risks / Trade-offs

- Applying the migration still requires Supabase admin access -> provide SQL migration to run in Dashboard/CLI.
- No binary upload yet -> admins can paste or preserve an image URL until Storage UI is added.
- Barcode uniqueness is global for non-null values -> inactive products keep their barcode reserved to avoid ambiguity in historical lookup.
