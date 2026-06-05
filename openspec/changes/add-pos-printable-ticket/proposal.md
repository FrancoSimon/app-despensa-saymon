## Why

The POS currently shows an internal ticket on screen after confirming a sale, but sellers need a printable/downloadable record they can open later. Browsers can save print views as PDF, so a dedicated ticket route provides the required operational workflow without adding a PDF dependency.

## What Changes

- Add a sale ticket data query.
- Add `/vendedor/ventas/[id]/ticket`.
- Add a print/save-PDF button on the ticket page.
- Link the confirmed-sale ticket card to the printable ticket.
- Keep the ticket explicitly marked as internal and non-fiscal.

## Capabilities

### Modified Capabilities

- `pos-sales`: Implement printable/downloadable internal ticket workflow.
- `api-surface`: Add seller ticket route for completed counter sales.

## Impact

- Affected files: `app/vendedor`, `components/pos`, `lib/sales`, OpenSpec artifacts.
- No new database migration required.
