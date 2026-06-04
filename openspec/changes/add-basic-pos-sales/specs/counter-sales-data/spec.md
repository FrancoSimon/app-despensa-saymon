## ADDED Requirements

### Requirement: Counter Sale Tables
The system SHALL persist counter sales and sale items.

#### Scenario: Sale is registered
- **WHEN** a counter sale is confirmed
- **THEN** the system stores a sale row with seller, timestamp, subtotal, discount, surcharge, total, payment method, and type `mostrador`
- **AND** stores sale item rows with product, quantity, unit price, and subtotal

### Requirement: Atomic Sale Confirmation
The system SHALL confirm counter sales atomically.

#### Scenario: Stock is sufficient
- **WHEN** all sale items have enough stock
- **THEN** the system inserts the sale and items
- **AND** decrements product stock in the same transaction

#### Scenario: Stock is insufficient
- **WHEN** any sale item exceeds available stock
- **THEN** the system rejects the sale
- **AND** does not insert sale rows
- **AND** does not decrement stock
