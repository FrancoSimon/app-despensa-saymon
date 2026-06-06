## Why

Report cards link to filtered admin pages, but those pages return to the admin panel instead of the report that originated the navigation.

## What Changes

- Preserve report return paths for admin sales, cash register history, and wholesale order filters.
- Keep return paths while changing filters inside those pages.
- Preserve return paths through sale ticket and cash register detail links.

## Impact

- Affected specs: `api-surface`, `reports-analytics`.
- Affected files: `app/admin/reportes`, `app/admin/ventas`, `app/admin/cajas`, `app/admin/pedidos`, `components/wholesale`, OpenSpec artifacts.
