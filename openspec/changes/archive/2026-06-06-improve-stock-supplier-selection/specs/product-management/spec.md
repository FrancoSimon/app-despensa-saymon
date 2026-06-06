## MODIFIED Requirements

### Requirement: Stock Panel Product Selection
The admin stock panel SHALL support searchable product and supplier selection for stock operations.

#### Scenario: Admin searches product in stock forms
- **WHEN** an admin registers a purchase/lote or manual stock movement
- **THEN** the admin can search products by name, category, or barcode before selecting the product
- **AND** the submitted form contains the selected product id

#### Scenario: Admin searches supplier in stock purchase form
- **WHEN** an admin registers a purchase/lote
- **THEN** the admin can search existing suppliers by name, phone, CUIT, email, or contact person
- **AND** the submitted form contains the selected supplier id

#### Scenario: Admin creates supplier from stock purchase form
- **WHEN** the supplier is new
- **THEN** the admin can open a supplier modal and enter supplier details
- **AND** the submitted purchase creates or reuses the supplier with those details
