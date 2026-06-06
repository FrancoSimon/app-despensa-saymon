## Why

Counter sales can be entered incorrectly. The system should not delete sales because they are part of the commercial record, but admins and sellers need a controlled way to cancel a sale, restore stock, and keep the reason visible.

## What Changes

- Add cancellation metadata to counter sales.
- Add an RPC to cancel active counter sales and restore stock atomically.
- Record stock entry movements linked to the canceled sale.
- Add a cancel action to the internal ticket page.
- Exclude canceled sales from sales summaries and best-seller reports.

## Impact

- Affected specs: `pos-sales`, `reports-analytics`, `supabase-schema`.
- Affected files: `supabase/migrations`, `app/vendedor/ventas/[id]/ticket`, `lib/sales`, `lib/reports`, OpenSpec artifacts.

