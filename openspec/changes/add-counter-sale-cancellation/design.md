## Context

Sales are immutable records used for traceability. Product stock is deducted by the sale confirmation RPC and automatic stock history now records those exits. A cancellation should preserve the original sale while reversing operational stock impact.

## Decisions

1. Mark the sale as canceled instead of deleting it.
   - Rationale: deletion would break ticket history and reports auditing.

2. Restore full item quantities only.
   - Rationale: partial returns are more complex and can be added later as a separate returns workflow.

3. Insert stock movements with `origen = 'venta_mostrador'`.
   - Rationale: cancellation is tied to the same sale origin and uses `tipo = 'entrada'` to show stock restoration.

4. Use an RPC for cancellation.
   - Rationale: checking sale state, locking rows, restoring stock, and writing movements must be atomic.

## Non-Goals

- Partial returns.
- Payment refunds or cash drawer corrections.
- Deleting sale rows.

