## Why

Stock purchases need better supplier selection. A long supplier select is hard to use, and new suppliers should be captured with structured data that can support future purchase documents, supplier accounts, and reports.

## What Changes

- Add searchable supplier selection to the purchase/lote form.
- Add a modal for new supplier data entry.
- Extend supplier fields with contact, tax, and address data.
- Persist new supplier fields when registering a stock purchase.

## Impact

- Affected specs: product-management, data-model
- Affected code: stock purchase form, supplier types/queries/actions, Supabase migration
