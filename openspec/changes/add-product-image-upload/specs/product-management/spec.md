## MODIFIED Requirements

### Requirement: Product Image Upload
The system SHALL allow admins to upload one product image to Supabase Storage.

#### Scenario: Admin uploads image
- **WHEN** an admin selects a JPG, PNG, or WEBP file up to 2MB
- **THEN** the system uploads it to the `product-images` Supabase Storage bucket
- **AND** stores the public URL in `imagenUrl`
- **AND** shows a preview before saving

#### Scenario: Admin edits existing image
- **WHEN** an admin edits a product with an existing image
- **THEN** the form shows the existing image preview
- **AND** preserves the URL unless a replacement image is selected
