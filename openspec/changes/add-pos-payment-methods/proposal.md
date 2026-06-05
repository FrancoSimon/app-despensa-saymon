## Why

The POS currently supports only cash and QR. SAYMON needs to record common counter payment methods: credit card, debit card, and bank transfer.

## What Changes

- Extend the Supabase `forma_pago_venta` enum.
- Add credit, debit, and transfer options to the POS cart.
- Validate the new payment methods in the sale action.
- Show readable payment labels in tickets and reports.
- Split report payment totals by cash, QR, card, and transfer.

## Capabilities

### Modified Capabilities

- `pos-sales`: Add more payment methods to checkout and ticket display.
- `reports-analytics`: Include new payment methods in payment totals.
- `supabase-schema`: Add enum values for additional sale payment methods.

## Impact

- Affected files: `supabase/migrations`, `components/pos`, `lib/sales`, `lib/reports`, `app/admin/reportes`, OpenSpec artifacts.
