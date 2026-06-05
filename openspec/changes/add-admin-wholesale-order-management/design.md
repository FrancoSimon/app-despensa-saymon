## Context

Pending wholesale orders are already stored in Supabase with item snapshots. Admin management needs to be transactionally safe because confirmation changes both order state and product stock.

## Goals / Non-Goals

**Goals:**

- List all pending wholesale orders for admins, oldest first.
- Show customer, delivery, totals, comments, item quantities, and current stock.
- Confirm an order only when every product has enough stock.
- Deduct stock exactly once during confirmation.
- Reject an order without modifying stock.

**Non-Goals:**

- Delivery route planning.
- Partial fulfillment.
- Editing item quantities inside an order.
- Marking confirmed orders as delivered.

## Decisions

1. Use security-definer RPCs for state transitions.
   - Rationale: stock checks, stock updates, and status changes must happen atomically in the database.

2. Keep the admin page focused on pending orders.
   - Rationale: the current spec requires pending review first; broader history and delivered workflow can follow.

3. Use the desired delivery date as the default assigned delivery date.
   - Rationale: admins can accept the requested Saturday quickly but still choose another valid Saturday if needed.

## Risks / Trade-offs

- If the wholesale order migration has not been applied, the admin page cannot show real pending orders yet.
- The RPC rejects non-pending orders, preventing double stock deduction.
- Stock is checked against current product stock, not stock at order creation time.
