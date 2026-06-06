## Why

The internal sale receipt should be ready for everyday printing and sharing before moving to stock and provider work. The current receipt exposes the right data, but it still uses raw short UUIDs as the primary identifier and does not centralize business header details.

## What Changes

- Add a stable human-readable internal receipt number derived from the sale date and id.
- Centralize business receipt details so the header/footer can be updated in one place.
- Tune the printable receipt for narrow thermal-style paper while preserving browser print/save-PDF support.
- Keep the receipt clearly marked as internal and non-fiscal.

## Impact

- Affected specs: `pos-sales`
- Affected files: `app/vendedor/ventas/[id]/ticket`, `lib`, OpenSpec artifacts.
