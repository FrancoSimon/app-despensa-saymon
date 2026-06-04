## Why

Product creation currently requires admins to paste an image URL manually. SAYMON needs the expected admin workflow: select a local product photo, preview it, upload it to Supabase Storage, and save the resulting URL on the product.

## What Changes

- Add a Supabase Storage bucket for product images with MIME type and file size restrictions.
- Add Storage RLS policies so only admins can upload/update/delete product images while product images can be served publicly.
- Replace the manual image URL field with a file picker, preview, upload state, and hidden `imagenUrl` value.
- Keep existing image URLs when editing unless a new file is uploaded.

## Capabilities

### New Capabilities

- `product-image-upload`: Client-side product image upload, preview, and URL persistence.

### Modified Capabilities

- `product-management`: Product image field changes from manual URL entry to Supabase Storage-backed upload.
- `supabase-schema`: Add product image bucket and storage object policies.

## Impact

- Affected files: product form component, product validation, Supabase migration, setup docs.
- Affected systems: Supabase Storage bucket `product-images`, `storage.objects` RLS policies, product admin UI.
