## Why

Stock changes should be traceable. Admins can edit product stock directly, but replenishments and manual corrections need a movement history with reason, previous stock, and resulting stock.

## What Changes

- Add stock movement table and RPC.
- Add `/admin/stock`.
- Allow admins to register stock entries and exits.
- Show recent stock movement history.
- Link the low-stock dashboard card to stock management.

## Capabilities

### Modified Capabilities

- `product-management`: Add stock movement registration and history.
- `supabase-schema`: Add stock movement persistence and RPC.
- `api-surface`: Add admin stock route.

## Impact

- Affected files: `supabase/migrations`, `app/admin/stock`, `components/stock`, `lib/stock`, `app/admin/page.tsx`, OpenSpec artifacts.
