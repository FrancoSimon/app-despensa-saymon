## Why

Admins can adjust stock manually, but the business process for inventory growth is a purchase from a supplier. The system needs to preserve supplier, quantity, unit cost, and purchase evidence so future reports can estimate profit and audit stock entries.

## What Changes

- Add supplier records managed from the stock purchase flow.
- Add stock purchase records with product, quantity, unit cost, total cost, date, optional receipt number, and notes.
- Register purchases through an admin RPC that updates product stock atomically and stores a linked stock movement.
- Store the latest purchase cost on the product for future profit estimates.
- Show a purchase/lote form and recent purchase history on the admin stock panel.

## Impact

- Affected specs: `product-management`, `data-model`
- Affected files: `supabase/migrations`, `app/admin/stock`, `lib/stock`, `lib/products`, OpenSpec artifacts.
