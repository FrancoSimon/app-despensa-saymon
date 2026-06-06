## Why

Confirmed wholesale orders already deducted stock. If a confirmed order must be canceled before delivery, the system needs a traceable reversal that restores stock and clearly separates this case from rejecting a pending order.

## What Changes

- Add `cancelado` as a wholesale order state.
- Add an admin RPC to cancel confirmed wholesale orders.
- Restore stock and insert stock entry movements when a confirmed order is canceled.
- Add a cancel control for confirmed wholesale orders.
- Include canceled orders in admin filters and reports.

## Impact

- Affected specs: `order-management`, `reports-analytics`, `supabase-schema`.
- Affected files: `supabase/migrations`, `components/wholesale`, `lib/wholesale`, `lib/reports`, OpenSpec artifacts.

