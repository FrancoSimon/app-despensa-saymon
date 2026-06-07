## ADDED Requirements

### Requirement: POS Cash Change Helper
The POS SHALL calculate change for cash payments during sale confirmation.

#### Scenario: Seller confirms cash sale
- **WHEN** a seller confirms a counter sale with cash payment
- **THEN** the app asks for the amount received
- **AND** shows the exact change to give
- **AND** prevents confirming when the received amount is less than the sale total

### Requirement: Wholesale Ordering UX
The wholesale portal SHALL provide fast product selection, keyboard shortcuts, and clear order confirmation.

#### Scenario: Wholesaler searches products
- **WHEN** a wholesaler types in product search
- **THEN** matching products are prioritized by exact barcode, name prefix, name match, category, and barcode match

#### Scenario: Wholesaler confirms order
- **WHEN** a wholesaler attempts to send an order
- **THEN** the app shows a summary before submitting the order

#### Scenario: Wholesaler uses shortcuts
- **WHEN** a wholesaler is on the ordering screen
- **THEN** the app supports shortcuts for focusing search, focusing category, clearing the cart, and confirming the order
