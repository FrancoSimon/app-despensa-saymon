## ADDED Requirements

### Requirement: Product Images Bucket
The system SHALL provide a checked-in Supabase migration for the product images bucket.

#### Scenario: Developer applies storage migration
- **WHEN** the migration is run
- **THEN** Supabase has a public `product-images` bucket restricted to JPG, PNG, and WEBP files up to 2MB

### Requirement: Product Images Storage Policies
The system SHALL restrict product image writes to admins.

#### Scenario: Admin uploads product image
- **WHEN** an authenticated active admin uploads to `product-images`
- **THEN** Storage RLS allows the upload

#### Scenario: Non-admin uploads product image
- **WHEN** a seller or wholesaler attempts to upload to `product-images`
- **THEN** Storage RLS denies the upload
