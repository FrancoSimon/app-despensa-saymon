## Why

SAYMON needs a real product catalog before POS, wholesale orders, stock alerts, and reports can work. Products are the first business data module that makes the authenticated admin shell operational.

## What Changes

- Add the initial Supabase schema for `productos` with dual pricing, stock, low-stock threshold, wholesale visibility, optional barcode, image URL, and logical deactivation.
- Add RLS policies for admin management, seller active-product reads, and wholesale active-enabled reads.
- Add admin UI under `/admin/productos` for listing, creating, editing, searching, and deactivating products.
- Add admin dashboard links/cards for product management and low-stock count.
- Defer Supabase Storage binary upload and bulk price update to future changes.

## Capabilities

### New Capabilities

- `product-admin-ui`: Admin-facing product list, create, edit, and deactivate flows.

### Modified Capabilities

- `product-management`: Implement the MVP subset of product CRUD, dual pricing, barcode, stock, wholesale flag, image URL, and low-stock count.
- `data-model`: Add concrete `productos` table shape.
- `supabase-schema`: Add products migration and RLS policies.
- `app-shell`: Add admin navigation to product management.

## Impact

- Affected files: `supabase/migrations`, `app/admin/productos`, `lib/products`, `components/layout`, OpenSpec artifacts.
- Affected systems: Supabase PostgreSQL and RLS, admin authenticated routes.
