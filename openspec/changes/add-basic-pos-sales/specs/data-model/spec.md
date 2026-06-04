## MODIFIED Requirements

### Requirement: Sale Entity
The system SHALL store counter sale transactions.

#### Scenario: Counter sale is persisted
- **WHEN** a sale is registered
- **THEN** the system stores id, seller user id, date, subtotal, total, type `mostrador`, discount percentage, surcharge percentage, payment method, and timestamps

### Requirement: Sale Item Entity
The system SHALL store immutable counter sale item snapshots.

#### Scenario: Sale item is persisted
- **WHEN** a sale item is registered
- **THEN** the system stores sale id, product id, product name snapshot, quantity, unit price, and subtotal
