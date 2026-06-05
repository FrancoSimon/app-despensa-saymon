## Why

Wholesale orders currently happen outside the system, mainly through WhatsApp, with no structured catalog, delivery date validation, or order traceability. SAYMON needs a B2B order intake flow before admins can manage and confirm wholesale orders.

## What Changes

- Add Supabase tables for wholesale orders and order items.
- Add RLS so wholesale users can create/read their own pending orders and admins can read all orders.
- Replace the wholesale placeholder page with a catalog and cart experience.
- Apply fixed and special wholesale pricing in the cart.
- Validate Saturday delivery dates with the Thursday 23:59 cutoff.
- Create orders as `pendiente` without deducting stock.
- Defer admin confirm/reject workflow to the next change.

## Capabilities

### New Capabilities

- `wholesale-order-data`: Wholesale order tables, items, statuses, and pending-order creation RPC.

### Modified Capabilities

- `wholesale-b2b`: Implement catalog, cart, Saturday delivery selection, pending order creation, and own order history.
- `data-model`: Add concrete wholesale order and item storage.
- `supabase-schema`: Add B2B order migration, indexes, RLS, and RPC.

## Impact

- Affected files: `supabase/migrations`, `app/mayorista`, `components/b2b`, `lib/wholesale`, OpenSpec artifacts.
- Affected systems: Supabase PostgreSQL, wholesale route.
