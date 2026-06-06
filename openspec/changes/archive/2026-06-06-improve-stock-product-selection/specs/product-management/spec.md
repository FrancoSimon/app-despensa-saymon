## MODIFIED Requirements

### Requirement: Product CRUD
The system SHALL allow admins to create, read, update, and deactivate products while preserving safe admin return paths.

#### Scenario: Admin creates product
- **WHEN** an admin submits a product form
- **THEN** the system validates required fields including name, counter price, and stock
- **AND** saves the product when validation passes

#### Scenario: Admin deactivates product
- **WHEN** an admin removes a product from active use
- **THEN** the system marks it inactive or deleted logically
- **AND** keeps the database record to preserve links with sales, invoices, orders, and reports
- **AND** excludes inactive products from normal product selection unless an admin explicitly filters for them

#### Scenario: Admin edits product from stock panel
- **WHEN** an admin opens a product edit page from the stock panel
- **THEN** the product edit page provides a back link to the stock panel
- **AND** saving the product returns to the stock panel

## ADDED Requirements

### Requirement: Stock Panel Product Selection
The admin stock panel SHALL support searchable product selection for stock operations.

#### Scenario: Admin searches product in stock forms
- **WHEN** an admin registers a purchase/lote or manual stock movement
- **THEN** the admin can search products by name, category, or barcode before selecting the product
- **AND** the submitted form contains the selected product id
