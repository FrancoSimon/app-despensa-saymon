## Why

Some counter sales are delivered to known customers and paid later. The app needs a current-account workflow so sellers can register debt at checkout, admins can review balances, record partial or full payments, and issue an internal receipt for each payment.

## What Changes

- Add `cuenta_corriente` as a counter-sale payment method.
- Require a customer when selling on current account.
- Store customer account movements for debt and payments.
- Add an admin current-account panel with balances and payment form.
- Add printable internal payment receipt.

## Impact

- Affected specs: `pos-sales`, `data-model`, `api-surface`
- Affected files: `supabase/migrations`, `components/pos`, `app/admin/cuentas-corrientes`, `lib/accounts`, `lib/sales`, OpenSpec artifacts.
