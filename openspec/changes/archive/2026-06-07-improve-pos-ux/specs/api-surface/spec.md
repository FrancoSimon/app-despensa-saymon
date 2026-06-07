## ADDED Requirements

### Requirement: Fast POS Search
The POS SHALL support fast product selection by search, barcode, and keyboard.

#### Scenario: Seller searches products
- **WHEN** a seller types in the product search
- **THEN** matching products are prioritized by exact barcode, name prefix, name match, category, and barcode match

#### Scenario: Seller uses keyboard product entry
- **WHEN** the product search is focused and the seller presses Enter
- **THEN** the first visible product is added to the cart when available

### Requirement: POS Keyboard Shortcuts
The POS SHALL provide keyboard shortcuts for frequent counter actions.

#### Scenario: Seller uses shortcuts
- **WHEN** a seller is on the POS screen
- **THEN** the app supports shortcuts for focusing search, selecting payment method, clearing the cart, and confirming the sale

### Requirement: POS Confirmation And Safety
The POS SHALL clearly confirm the sale before submitting and keep server-side permission checks enforced.

#### Scenario: Seller confirms sale
- **WHEN** a seller attempts to confirm a sale
- **THEN** the app shows a summary of the sale before submitting

#### Scenario: Sale is blocked
- **WHEN** the cash register is closed or account-current sale has no customer
- **THEN** the app blocks confirmation and explains the required action
