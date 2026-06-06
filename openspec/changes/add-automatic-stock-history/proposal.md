## Why

Stock movements are traceable for manual admin adjustments, but automatic stock deductions from counter sales and confirmed wholesale orders are not visible in the stock history. Admins need one audit trail that explains why stock changed.

## What Changes

- Extend stock movements with origin metadata.
- Record stock exits when a counter sale is confirmed.
- Record stock exits when a wholesale order is confirmed.
- Show movement origin in the admin stock history.

## Impact

- Affected specs: `product-management`, `pos-sales`, `order-management`, `supabase-schema`.
- Affected files: `supabase/migrations`, `app/admin/stock`, `lib/stock`, `lib/sales`, `lib/wholesale`, OpenSpec artifacts.

