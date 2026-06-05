## Context

Products already support wholesale visibility and special pricing fields. The mayorista route is protected but still a placeholder. The B2B MVP should let wholesale users create traceable pending orders without touching stock; stock deduction belongs to the later admin confirmation flow.

## Goals / Non-Goals

**Goals:**

- Show active wholesale-enabled products.
- Calculate fixed vs special wholesale unit price by quantity.
- Validate delivery date rules in the UI and in the database RPC.
- Persist pending wholesale orders and item price snapshots.
- Show the wholesale user's recent order history.

**Non-Goals:**

- Admin order confirmation/rejection.
- Stock deduction for wholesale orders.
- Payment collection or online checkout.

## Decisions

1. Use a security-definer RPC for order creation.
   - Rationale: the database must calculate authoritative prices and validate delivery date rules.

2. Store wholesale item price snapshots.
   - Rationale: future product price changes must not alter historical order totals.

3. Use a single `/mayorista` screen for MVP.
   - Rationale: catalog, cart, delivery date, and history fit in one focused workflow for the first pass.

## Risks / Trade-offs

- Date cutoff depends on database timezone. The RPC uses `America/Argentina/Buenos_Aires` to match business rules.
- Products with changed wholesale flags after cart load are revalidated by the RPC.
- Admin management is intentionally deferred, so pending orders become visible to admins only through future UI or SQL for now.
