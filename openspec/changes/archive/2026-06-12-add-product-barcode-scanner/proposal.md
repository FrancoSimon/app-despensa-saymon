## Why

Admins can already type a barcode manually when creating or editing products, but loading many products is faster and less error-prone when the code can be captured with a barcode reader or device camera.

## What Changes

- Add a scanner control next to the product barcode field.
- Preserve manual barcode entry exactly as today.
- When a barcode is detected, place the decoded value into the existing `codigoBarras` form field.
- Show clear scanner status and errors inside the product form.

## Capabilities

### New Capabilities

### Modified Capabilities
- `product-management`: Product barcode entry supports both manual input and scanner capture in the admin product form.

## Impact

- Affected UI: `components/products/product-form.tsx`.
- New reusable component for barcode value capture may reuse `html5-qrcode`, already present for POS scanning.
- No database or API schema changes.
