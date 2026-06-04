## MODIFIED Requirements

### Requirement: Product Search
The POS SHALL allow sellers to search active products by name or barcode.

#### Scenario: Seller searches by name
- **WHEN** a seller types a search term
- **THEN** the system searches active product names case-insensitively using contains matching
- **AND** shows up to 10 results

#### Scenario: Seller searches by barcode
- **WHEN** a seller enters an exact barcode
- **THEN** the system returns the matching active product when it exists

### Requirement: Cart Management
The POS SHALL maintain a cart before checkout.

#### Scenario: Seller manages cart items
- **WHEN** a seller adds a product
- **THEN** the item quantity defaults to 1
- **AND** the seller can increase, decrease, remove an item, or empty the cart
- **AND** the system displays item subtotals and the cart total

### Requirement: Discount and Surcharge
The POS SHALL allow percentage discount and surcharge adjustments before checkout.

#### Scenario: Seller applies adjustments
- **WHEN** the seller enters discount or surcharge values from 0 to 100
- **THEN** the system applies discount after subtotal
- **AND** applies surcharge after discount
- **AND** shows intermediate calculations

### Requirement: Sale Confirmation and Stock Deduction
The POS SHALL register counter sales and deduct stock only when stock is sufficient.

#### Scenario: Seller confirms sale with enough stock
- **WHEN** the seller confirms checkout
- **THEN** the system verifies stock for each item
- **AND** deducts product stock
- **AND** registers a sale with type `mostrador`
- **AND** shows the sale ticket

#### Scenario: Seller confirms sale without enough stock
- **WHEN** any cart item exceeds available stock
- **THEN** the system blocks checkout
- **AND** shows a stock insufficiency error
- **AND** does not register the sale

### Requirement: Internal Ticket PDF
The POS SHALL show an internal ticket summary after sale completion and SHALL support downloadable PDF generation in a future change.

#### Scenario: Ticket is shown
- **WHEN** a sale is completed
- **THEN** the ticket includes SAYMON, date, time, sale number, items, quantities, unit prices, subtotals, discount, surcharge, total, and payment method
- **AND** the ticket is an internal sales record, not a fiscal or legal invoice
