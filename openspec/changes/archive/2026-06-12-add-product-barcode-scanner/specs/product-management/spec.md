## MODIFIED Requirements

### Requirement: Optional Unique Barcode
Products SHALL support an optional unique barcode that admins can enter manually or capture with a barcode scanner in the product form.

#### Scenario: Admin enters barcode manually
- **WHEN** an admin types or pastes `codigoBarras` in the product form
- **THEN** the form keeps that value for product creation or update
- **AND** the system validates it is unique when submitted

#### Scenario: Admin scans barcode in product form
- **WHEN** an admin uses the barcode scanner in the product form and a code is detected
- **THEN** the detected code is placed into the `codigoBarras` field
- **AND** the admin can review or edit the value before submitting

#### Scenario: Product has no barcode
- **WHEN** a product has no barcode
- **THEN** POS users can still find it by name
