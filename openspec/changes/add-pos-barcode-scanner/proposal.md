## Why

Sellers can search by barcode manually, but a camera scanner speeds up counter sales and reduces typing errors.

## What Changes

- Add `html5-qrcode` as the barcode scanning library.
- Add a scanner panel to the POS.
- When a barcode is detected, match it against loaded products and add the product to the cart.
- Show actionable errors when camera access fails or no product matches the scanned barcode.

## Capabilities

### Modified Capabilities

- `pos-sales`: Implement camera barcode scanning.

## Impact

- Affected files: `package.json`, `package-lock.json`, `components/pos`, OpenSpec artifacts.
- No database migration required.
