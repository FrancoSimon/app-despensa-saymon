## Why

Wholesale users can now create pending orders, but admins still need an operational view to decide whether those orders can be fulfilled. The next business-critical step is confirming or rejecting pending wholesale orders with stock-safe behavior.

## What Changes

- Add database RPCs for admin confirmation and rejection.
- Confirming verifies stock atomically, deducts stock, assigns delivery date, and marks the order `confirmado`.
- Rejecting stores an optional reason and marks the order `rechazado` without stock impact.
- Add an admin pending-orders page with order details, customer data, item stock visibility, confirm action, and reject action.
- Link the admin dashboard "Pedidos" card to the new page.

## Capabilities

### Modified Capabilities

- `order-management`: Implement admin pending order list, confirmation, rejection, and stock-safe transitions.
- `supabase-schema`: Add admin wholesale order management RPCs.
- `api-surface`: Add admin route for wholesale pending orders.

## Impact

- Affected files: `supabase/migrations`, `app/admin/pedidos`, `components/wholesale`, `lib/wholesale`, `app/admin/page.tsx`, OpenSpec artifacts.
- Affected systems: Supabase PostgreSQL, admin workflow, product stock.
