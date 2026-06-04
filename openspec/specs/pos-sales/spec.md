## Purpose

Define the seller point-of-sale flow for counter sales.

## Requirements

### Requirement: Product Search
The POS SHALL allow sellers to search products by name or barcode.

#### Scenario: Seller searches by name
- **WHEN** a seller types a search term
- **THEN** the system searches product names case-insensitively using contains matching
- **AND** shows up to 10 results

#### Scenario: Seller searches by barcode
- **WHEN** a seller enters an exact barcode
- **THEN** the system returns the matching product when it exists

### Requirement: Camera Barcode Scanner
The POS SHALL support barcode scanning with a webcam using `html5-qrcode`.

#### Scenario: Seller scans product
- **WHEN** the seller presses "Escanear"
- **THEN** the system opens the camera stream
- **AND** detects a barcode automatically
- **AND** adds the detected product to the cart
- **AND** closes the camera after a successful scan

#### Scenario: Barcode scan fails
- **WHEN** no barcode is detected or camera access fails
- **THEN** the system shows an actionable error

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
The POS SHALL generate a downloadable and printable internal PDF ticket after sale completion.

#### Scenario: Ticket is generated
- **WHEN** a sale is completed
- **THEN** the ticket includes SAYMON, date, time, sale number, items, quantities, unit prices, subtotals, discount, surcharge, total, and payment method
- **AND** the seller can download or print the PDF
- **AND** the ticket is an internal sales record, not a fiscal or legal invoice
