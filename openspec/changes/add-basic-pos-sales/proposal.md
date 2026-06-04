## Why

SAYMON now has real products, so the next business-critical step is registering counter sales and decrementing stock. This closes the first operational loop: product catalog -> POS cart -> sale record -> stock update.

## What Changes

- Add Supabase tables for counter sales and sale items.
- Add a transactional RPC to confirm a sale, validate stock, insert sale/items, and decrement product stock atomically.
- Replace the seller placeholder page with a basic POS terminal.
- Support product search, cart quantities, discount, surcharge, cash/QR payment method, and an internal ticket summary.
- Defer webcam barcode scanning and PDF generation to later changes.

## Capabilities

### New Capabilities

- `counter-sales-data`: Counter sale tables and transactional confirmation RPC.

### Modified Capabilities

- `pos-sales`: Implement MVP search, cart, adjustments, sale confirmation, stock deduction, and internal ticket display.
- `data-model`: Add concrete sale and sale item storage.
- `supabase-schema`: Add sales migration, indexes, RLS, and RPC.

## Impact

- Affected files: `supabase/migrations`, `app/vendedor`, `components/pos`, `lib/sales`, product queries.
- Affected systems: Supabase PostgreSQL, products stock, seller route.
