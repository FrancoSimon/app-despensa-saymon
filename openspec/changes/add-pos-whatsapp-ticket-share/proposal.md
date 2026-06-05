## Why

Sellers need to send the internal sale ticket through WhatsApp in addition to printing or saving it as PDF. The browser cannot reliably attach a generated PDF to WhatsApp without a stored file, so the first safe implementation should share a formatted text ticket.

## What Changes

- Add a WhatsApp share button on the printable ticket page.
- Generate a formatted ticket message with sale number, date, items, totals, payment method, and non-fiscal disclaimer.
- Open WhatsApp Web/app using a prefilled message.

## Capabilities

### Modified Capabilities

- `pos-sales`: Extend internal ticket workflow with WhatsApp text sharing.

## Impact

- Affected files: `app/vendedor/ventas/[id]/ticket`, `components/pos`, OpenSpec artifacts.
- No database migration required.
