## Why

Cash register closing currently considers only opening cash and cash sales. Real counters also need manual cash movements during a shift, such as adding change or withdrawing cash for a supplier/payment. Without those records, the expected cash can be misleading.

## What Changes

- Add cash register movements linked to a cash register.
- Allow sellers/admins to register cash income or withdrawal while the register is open.
- Include movement totals in expected cash at close.
- Show movements in seller cash register panel and admin cash register detail.

## Impact

- Affected specs: `api-surface`, `reports-analytics`, `data-model`.
- Affected files: `supabase/migrations`, `app/vendedor/caja`, `app/admin/cajas/[id]`, `components/cash`, `lib/cash`, OpenSpec artifacts.
