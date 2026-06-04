## ADDED Requirements

### Requirement: Product Image File Picker
The system SHALL let admins select a product image file from the product form.

#### Scenario: Admin selects image
- **WHEN** an admin selects a JPG, PNG, or WEBP file up to 2MB
- **THEN** the form displays a preview before saving

#### Scenario: Admin selects invalid image
- **WHEN** an admin selects a non-image file or a file larger than 2MB
- **THEN** the form blocks upload
- **AND** shows a clear validation message

### Requirement: Product Image Upload
The system SHALL upload product images to Supabase Storage before saving the product.

#### Scenario: Admin saves product with image
- **WHEN** an admin submits a product form with a selected image
- **THEN** the image is uploaded to the `product-images` bucket
- **AND** the public image URL is saved in `productos.imagen_url`

### Requirement: Existing Image Preservation
The system SHALL preserve an existing product image when editing unless a new image is selected.

#### Scenario: Admin edits without new image
- **WHEN** an admin edits a product and does not select a new image
- **THEN** the existing `imagen_url` remains unchanged
