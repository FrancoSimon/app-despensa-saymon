## Purpose

Define product, price, barcode, image, and stock management for SAYMON.

## Requirements

### Requirement: Product CRUD
The system SHALL allow admins to create, read, update, and deactivate products.

#### Scenario: Admin creates product
- **WHEN** an admin submits a product form
- **THEN** the system validates required fields including name, counter price, and stock
- **AND** saves the product when validation passes

#### Scenario: Admin deactivates product
- **WHEN** an admin removes a product from active use
- **THEN** the system marks it inactive or deleted logically
- **AND** keeps the database record to preserve links with sales, invoices, orders, and reports
- **AND** excludes inactive products from normal product selection unless an admin explicitly filters for them

### Requirement: Dual Pricing
Each product SHALL support separate public counter and wholesale prices.

#### Scenario: Product pricing is configured
- **WHEN** an admin edits a product
- **THEN** the system requires `precioMostrador`
- **AND** requires `precioMayoristaFijo`
- **AND** allows optional `precioMayoristaEspecial`
- **AND** stores `cantidadEspecial` with default value 0

#### Scenario: No special quantity
- **WHEN** `cantidadEspecial` is 0
- **THEN** the special wholesale price never applies

### Requirement: Optional Unique Barcode
Products SHALL support an optional unique barcode.

#### Scenario: Product has barcode
- **WHEN** an admin enters `codigoBarras`
- **THEN** the system validates it is unique

#### Scenario: Product has no barcode
- **WHEN** a product has no barcode
- **THEN** POS users can still find it by name

### Requirement: Product Image Upload
The system SHALL allow admins to upload one product image to Supabase Storage.

#### Scenario: Admin uploads image
- **WHEN** an admin selects a JPG, PNG, or WEBP file up to 2MB
- **THEN** the system uploads it to Supabase Storage
- **AND** stores the public URL in `imagenUrl`
- **AND** shows a preview before saving

### Requirement: Bulk Price Updates
The system SHALL allow admins to update prices in bulk by category and price type.

#### Scenario: Admin previews bulk update
- **WHEN** an admin selects a category or all categories
- **AND** selects counter, wholesale, or both price types
- **AND** chooses increase, decrease, percentage, or absolute value action
- **THEN** the system shows a preview before applying changes

#### Scenario: Admin confirms bulk update
- **WHEN** an admin confirms the bulk price update
- **THEN** the system applies the selected changes
- **AND** requires explicit confirmation before modifying prices

### Requirement: Minimum Stock Alerts
The system SHALL alert admins when product stock is below minimum stock.

#### Scenario: Product stock is low
- **WHEN** `stock` is lower than `stockMinimo`
- **THEN** the admin dashboard includes the product in the low-stock list
- **AND** the low-stock card counts it
