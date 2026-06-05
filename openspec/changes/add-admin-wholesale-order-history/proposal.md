## Why

After admins confirm or reject wholesale orders, those orders leave the pending-only view. Admins need a lightweight history to audit processed orders and complete the delivery lifecycle.

## What Changes

- Add an admin status filter to `/admin/pedidos`.
- Show pending, confirmed, delivered, rejected, or all wholesale orders.
- Add an admin RPC/action to mark confirmed orders as delivered without modifying stock.
- Keep pending confirmation/rejection behavior unchanged.

## Capabilities

### Modified Capabilities

- `order-management`: Add order history by status and delivery completion.
- `api-surface`: Extend `/admin/pedidos` with status filtering.
- `supabase-schema`: Add delivered transition RPC.

## Impact

- Affected files: `supabase/migrations`, `app/admin/pedidos`, `components/wholesale`, `lib/wholesale`, OpenSpec artifacts.
