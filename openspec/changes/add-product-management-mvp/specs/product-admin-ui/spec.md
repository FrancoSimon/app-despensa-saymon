## ADDED Requirements

### Requirement: Admin Product List
The system SHALL provide an admin product list at `/admin/productos`.

#### Scenario: Admin views products
- **WHEN** an authenticated admin opens `/admin/productos`
- **THEN** the system shows products with name, category, counter price, wholesale price, stock, minimum stock, wholesale status, and active status
- **AND** the admin can search by name, category, or barcode

### Requirement: Admin Product Create
The system SHALL allow admins to create products from the admin UI.

#### Scenario: Admin creates product
- **WHEN** an admin submits the new product form with valid required fields
- **THEN** the system creates the product
- **AND** returns the admin to the product list

### Requirement: Admin Product Edit
The system SHALL allow admins to edit existing products from the admin UI.

#### Scenario: Admin edits product
- **WHEN** an admin submits edits for an existing product
- **THEN** the system updates product fields
- **AND** preserves the same product id

### Requirement: Admin Product Deactivate
The system SHALL allow admins to deactivate products without deleting database rows.

#### Scenario: Admin deactivates product
- **WHEN** an admin chooses to deactivate a product
- **THEN** the system sets the product inactive
- **AND** keeps the product row for historical relationships
