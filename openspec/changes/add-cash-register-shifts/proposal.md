## Why

Counter sales are registered with payment methods, but the business still lacks daily/shift cash control. Sellers need to open a register before selling and close it with expected totals by payment method and counted cash.

## What Changes

- Add cash register shift persistence.
- Require an open cash register for counter sale confirmation.
- Associate counter sales with the open cash register.
- Add seller/admin cash register page for opening and closing.
- Add admin cash register history.

## Impact

- Affected specs: `pos-sales`, `reports-analytics`, `supabase-schema`, `api-surface`.
- Affected files: `supabase/migrations`, `app/vendedor/caja`, `app/admin/cajas`, `app/vendedor/page.tsx`, `app/admin/page.tsx`, `lib/cash`, `lib/sales`, OpenSpec artifacts.

