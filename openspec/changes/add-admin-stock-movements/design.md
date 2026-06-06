## Context

Product stock is already stored in `productos.stock`. Sales and confirmed wholesale orders decrement stock automatically. Admins still need a controlled way to record manual replenishments and corrections.

## Decisions

1. Use an RPC for stock movement registration.
   - Rationale: stock read, validation, update, and movement insert must happen atomically.

2. Start with `entrada` and `salida`.
   - Rationale: these cover replenishment and shrinkage/corrections while keeping the UI simple.

3. Store stock snapshots.
   - Rationale: `stock_anterior` and `stock_nuevo` make movement history auditable even if product stock changes later.

## Non-Goals

- Supplier purchase orders.
- Inventory valuation.
- Warehouse locations.
- Reverting movements.
