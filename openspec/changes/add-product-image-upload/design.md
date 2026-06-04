## Context

The product table already stores `imagen_url`. Supabase Storage official docs support bucket-level upload restrictions such as allowed MIME types and file size limits, and Storage access is controlled with RLS policies on `storage.objects`.

## Goals / Non-Goals

**Goals:**

- Create a public product image bucket with image-only, 2MB upload limits.
- Allow only active admins to upload/update/delete product images.
- Add a polished file picker and image preview in the product form.
- Upload before submitting the product form so the existing Server Actions continue saving `imagenUrl`.

**Non-Goals:**

- Image cropping, compression, or background removal.
- Deleting old image files when a product image is replaced.
- Private signed image URLs.

## Decisions

1. Use a public bucket.
   - Rationale: product images are catalog media, not sensitive files, and public buckets are simpler and performant for display.

2. Upload from the browser using the authenticated Supabase client.
   - Rationale: upload uses the user's Supabase session and Storage RLS can verify admin role.

3. Store files under `products/<timestamp>-<random>.<ext>`.
   - Rationale: avoids collisions without requiring a product id before creation.

## Risks / Trade-offs

- If the bucket migration is not applied, upload will fail with a clear UI error.
- Existing image URLs remain possible through hidden state, but admins no longer paste arbitrary URLs in the primary UI.
- Old files are not garbage-collected yet; this can be added when image replacement is mature.
