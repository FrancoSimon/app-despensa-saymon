## Context

`productos.stock` is updated by three paths: manual stock movements, POS sale confirmation, and wholesale order confirmation. The manual path already stores `stock_anterior` and `stock_nuevo`, but automatic paths only update product stock.

## Decisions

1. Add stock movement origin metadata.
   - Rationale: admins need to distinguish manual adjustments from automatic sale/order exits.

2. Reuse `stock_movimientos` for all stock-changing operations.
   - Rationale: one history table keeps the admin view simple and avoids fragmented audit trails.

3. Keep the existing `admin_id` column as the actor profile id.
   - Rationale: renaming the column would be a larger migration. It already references `profiles(id)` and can safely store admin or seller profiles.

4. Insert audit rows inside existing transactional RPCs.
   - Rationale: stock update and history insert must succeed or fail together.

## Non-Goals

- Restoring stock automatically on returns or order cancellation.
- Full supplier purchase management.
- Changing the current sale or wholesale order lifecycle.

