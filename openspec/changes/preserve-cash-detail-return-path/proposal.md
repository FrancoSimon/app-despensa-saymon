## Why

Cash register details can be opened from cash history or from reports. The detail page always returns to cash history, which breaks the reporting workflow.

## What Changes

- Allow cash register detail to receive a safe `volver` return path.
- Link report cash register rows with a return path back to the selected report period.

## Impact

- Affected specs: `api-surface`, `reports-analytics`.
- Affected files: `app/admin/cajas/[id]`, `app/admin/reportes`, OpenSpec artifacts.
