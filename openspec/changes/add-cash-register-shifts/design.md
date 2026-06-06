## Context

Sales already store seller, payment method, total, and cancellation state. A register shift can group sales by seller/admin and compute expected totals at close time.

## Decisions

1. One open cash register per profile.
   - Rationale: prevents mixing two open shifts for the same operator.

2. Require an open cash register to confirm counter sales.
   - Rationale: every sale should belong to a shift once cash control exists.

3. Store closing snapshots.
   - Rationale: if sales are later canceled or data changes, the closed cash register keeps the operator's closing record.

4. Compute expected totals from active sales only.
   - Rationale: canceled sales should not count toward cash totals.

## Non-Goals

- Cash withdrawals/deposits after opening.
- Multi-terminal physical register assignment.
- Payment refund tracking.

