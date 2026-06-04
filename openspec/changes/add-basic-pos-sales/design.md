## Context

Products are stored in Supabase and sellers can read active products via RLS. A counter sale must validate stock and update multiple tables consistently, so sale confirmation should happen in one PostgreSQL function instead of several client-side calls.

## Goals / Non-Goals

**Goals:**

- Register counter sales with seller, items, totals, discount, surcharge, and payment method.
- Deduct stock atomically only when every item has enough stock.
- Provide a usable POS screen for seller role.

**Non-Goals:**

- Camera barcode scanning.
- PDF generation.
- Offline mode or cash drawer/printer integration.

## Decisions

1. Use a security-definer RPC for checkout.
   - Rationale: stock validation, sale insert, item insert, and product stock updates must happen transactionally and seller RLS should not grant broad product updates.

2. Store unit price snapshot on sale items.
   - Rationale: future product price changes must not alter historical sale totals.

3. Use a client POS component with server action confirmation.
   - Rationale: cart state is interactive; final checkout still validates auth and stock on the server/database.

## Risks / Trade-offs

- RPC input is JSONB -> validate strongly in SQL and server action.
- Sale receipt is screen-only for now -> PDF is tracked in the existing POS spec for a later change.
- Search is client-side over active products for MVP -> acceptable for small catalog; can move to server search when catalog grows.
