## Context

Pending wholesale orders can be rejected without stock impact. Confirmed orders deduct stock and can later be marked delivered. There is no state for canceling a confirmed order and restoring stock.

## Decisions

1. Add a distinct `cancelado` state.
   - Rationale: `rechazado` means a pending order was not accepted; `cancelado` means a confirmed order was reversed.

2. Allow cancellation only from `confirmado`.
   - Rationale: delivered orders need a separate return flow, and pending orders already use rejection.

3. Restore stock through an RPC.
   - Rationale: state change, stock restoration, and stock movements must be atomic.

4. Reuse `motivo_rechazo` for the cancellation reason.
   - Rationale: it already stores the reason text associated with non-completed order outcomes.

## Non-Goals

- Canceling delivered orders.
- Partial wholesale returns.
- Payment or account balance management.

