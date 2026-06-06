## Why

The current counter-sale ticket works as an internal record, but the printed and WhatsApp versions can be clearer for daily operations. Sellers and admins need the receipt to expose audit fields, payment details, item lines, and reliable adjustment amounts while preserving the non-fiscal disclaimer.

## What Changes

- Improve the counter-sale ticket layout as an internal receipt/comprobante.
- Include cash register reference when the sale is linked to a register.
- Show sale status, cancellation details, seller, payment method, item details, and payment totals clearly.
- Keep the WhatsApp text aligned with the printable receipt.
- Correct displayed discount and surcharge amount calculations.

## Impact

- Affected specs: `pos-sales`
- Affected files: `app/vendedor/ventas/[id]/ticket`, `lib/sales`, OpenSpec artifacts.
