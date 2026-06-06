## MODIFIED Requirements

### Requirement: Product Entity
The system SHALL store product data for counter and wholesale sales.

#### Scenario: Product is persisted
- **WHEN** a product is saved
- **THEN** the system stores id, optional unique barcode, name, category, counter price, fixed wholesale price, optional special wholesale price, special quantity, stock, minimum stock, latest purchase cost, wholesale enabled flag, active flag, and optional image URL
- **AND** inactive products remain available for historical relationships

## ADDED Requirements

### Requirement: Supplier Entity
The system SHALL store supplier records for stock purchases.

#### Scenario: Supplier is persisted
- **WHEN** a supplier is saved
- **THEN** the system stores id, name, optional phone, optional notes, active flag, and timestamps

### Requirement: Stock Purchase Entity
The system SHALL store supplier purchase records that increase product stock.

#### Scenario: Stock purchase is persisted
- **WHEN** a stock purchase is registered
- **THEN** the system stores id, product id, supplier id, admin id, quantity, unit cost, total cost, purchase date, optional receipt number, optional notes, and linked stock movement id
