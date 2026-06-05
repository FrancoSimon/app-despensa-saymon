## MODIFIED Requirements

### Requirement: Discount and Surcharge
The POS SHALL allow percentage discount and surcharge adjustments before checkout.

#### Scenario: Seller applies adjustments
- **WHEN** the seller enters discount or surcharge values from 0 to 100
- **THEN** the system applies discount after subtotal
- **AND** applies surcharge after discount
- **AND** shows intermediate calculations

### Requirement: Payment Method Selection
The POS SHALL allow sellers to select supported payment methods before checkout.

#### Scenario: Seller selects payment method
- **WHEN** the seller checks out a sale
- **THEN** the seller can select efectivo, QR, tarjeta de credito, tarjeta de debito, or transferencia
- **AND** the selected payment method is stored with the sale
- **AND** tickets show a readable payment method label
