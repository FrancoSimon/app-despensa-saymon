## Why

The POS currently creates customers inline with only name and phone. Customer creation should not clutter the checkout surface, and the customer record should be ready for future legal/commercial use such as business name, tax condition, document data, and address.

## What Changes

- Replace inline quick customer fields in the POS with customer search plus a create button.
- Open a modal to create a customer with current and future-ready fields.
- Extend customer records with optional business/legal fields.
- Keep customer selection optional so checkout remains fast.

## Impact

- Affected specs: `pos-sales`, `data-model`
- Affected files: `supabase/migrations`, `components/pos`, `lib/customers`, OpenSpec artifacts.
