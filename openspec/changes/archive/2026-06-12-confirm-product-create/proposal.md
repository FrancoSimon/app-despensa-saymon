## Why

Creating a product changes the catalog, pricing, and stock data. Admins should have a clear confirmation step before saving a new product, especially when entering products quickly with barcode/image tools.

## What Changes

- Add an in-app confirmation modal when submitting the new product form.
- Keep edit product flow unchanged unless it uses the same create-only submit label.
- Submit the existing Server Action only after the admin confirms.
- Preserve current browser/server validation behavior before the confirmation opens.

## Capabilities

### New Capabilities

### Modified Capabilities
- `product-management`: Product creation requires an explicit in-app confirmation before saving.

## Impact

- Affected UI: `components/products/product-form.tsx`.
- Reuses the existing `ConfirmDialog` component.
- No database, API, or migration changes.
