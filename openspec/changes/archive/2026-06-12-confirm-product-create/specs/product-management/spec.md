## MODIFIED Requirements

### Requirement: Product CRUD
The system SHALL allow admins to create, read, update, and deactivate products while preserving safe admin return paths.

#### Scenario: Admin creates product
- **WHEN** an admin submits a new product form with valid required fields
- **THEN** the app shows an in-app confirmation modal before saving
- **AND** saves the product only after the admin confirms

#### Scenario: Admin deactivates product
- **WHEN** an admin removes a product from active use
- **THEN** the system marks it inactive or deleted logically
- **AND** keeps the database record to preserve links with sales, invoices, orders, and reports
- **AND** excludes inactive products from normal product selection unless an admin explicitly filters for them

#### Scenario: Admin edits product from stock panel
- **WHEN** an admin opens a product edit page from the stock panel
- **THEN** the product edit page provides a back link to the stock panel
- **AND** saving the product returns to the stock panel
