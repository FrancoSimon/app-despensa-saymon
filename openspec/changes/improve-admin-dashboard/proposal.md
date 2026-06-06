## Why

The admin landing page mostly shows module links. Admins need an immediate daily operational snapshot when they enter the panel.

## What Changes

- Add daily sales, sales count, cash register, cash difference, low-stock, and pending order indicators.
- Keep module links as quick actions below the daily snapshot.
- Link daily metrics to the relevant filtered pages.

## Impact

- Affected specs: `reports-analytics`, `api-surface`.
- Affected files: `app/admin/page.tsx`, OpenSpec artifacts.
