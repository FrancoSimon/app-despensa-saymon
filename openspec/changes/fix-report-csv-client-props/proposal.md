## Why

Reports crash because the server page passes column callback functions into a client CSV button. Next.js client component props must be serializable.

## What Changes

- Change the CSV export button to receive serializable headers and row values.
- Precompute CSV row values in the reports server component.

## Impact

- Affected specs: `reports-analytics`.
- Affected files: `components/reports/csv-export-button.tsx`, `app/admin/reportes/page.tsx`, OpenSpec artifacts.
