## Why

Counter sales are currently anonymous. The store should keep fast checkout as the default while allowing sellers to associate a sale with a known customer when useful for history, follow-up, and future discounts or account workflows.

## What Changes

- Add optional counter customer records.
- Allow sellers/admins to create active customers from the POS.
- Allow POS checkout to include an optional customer id.
- Store `cliente_id` on counter sales when provided.
- Show customer information on the internal ticket and WhatsApp summary.

## Impact

- Affected specs: `pos-sales`, `data-model`
- Affected files: `supabase/migrations`, `app/vendedor`, `components/pos`, `lib/customers`, `lib/sales`, OpenSpec artifacts.
