## MODIFIED Requirements

### Requirement: Product CRUD
The system SHALL allow admins to create, read, update, and deactivate products.

#### Scenario: Admin creates product
- **WHEN** an admin submits a product form
- **THEN** the system validates required fields including name, counter price, fixed wholesale price, and stock
- **AND** saves the product when validation passes

#### Scenario: Admin edits product
- **WHEN** an admin submits valid changes for a product
- **THEN** the system updates the existing product row

#### Scenario: Admin deactivates product
- **WHEN** an admin removes a product from active use
- **THEN** the system marks it inactive or deleted logically
- **AND** keeps the database record to preserve links with sales, invoices, orders, and reports
- **AND** excludes inactive products from normal product selection unless an admin explicitly filters for them

### Requirement: Product Image Upload
The system SHALL allow admins to store one image reference per product in the MVP and upload product images to Supabase Storage in a future enhancement.

#### Scenario: Admin stores image URL
- **WHEN** an admin enters an image URL for a product
- **THEN** the system stores the URL in `imagenUrl`

#### Scenario: Future image upload
- **WHEN** image upload is implemented
- **THEN** it supports JPG, PNG, or WEBP files up to 2MB, uploads to Supabase Storage, stores the public URL in `imagenUrl`, and shows a preview before saving
