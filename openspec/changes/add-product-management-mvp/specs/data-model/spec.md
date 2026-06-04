## MODIFIED Requirements

### Requirement: Product Entity
The system SHALL store product data for counter and wholesale sales.

#### Scenario: Product is persisted
- **WHEN** a product is saved
- **THEN** the system stores id, optional unique barcode, name, category, counter price, fixed wholesale price, optional special wholesale price, special quantity, stock, minimum stock, wholesale enabled flag, active flag, optional image URL, creation timestamp, and update timestamp
- **AND** inactive products remain available for historical relationships
