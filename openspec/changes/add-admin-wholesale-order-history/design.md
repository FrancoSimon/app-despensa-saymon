## Context

Wholesale orders now move from `pendiente` to `confirmado` or `rechazado`. The admin page should remain useful after those transitions by showing processed orders and allowing confirmed orders to be closed as delivered.

## Decisions

1. Reuse `/admin/pedidos` with an `estado` search param.
   - Rationale: avoids adding another admin section for a small workflow.

2. Add a security-definer RPC for `entregado`.
   - Rationale: state transitions should remain centralized and role-checked in the database.

3. Do not modify stock when marking delivered.
   - Rationale: stock impact already happens exactly once at confirmation.

## Non-Goals

- Editing confirmed orders.
- Restoring stock after rejection or delivery.
- Delivery route planning.
