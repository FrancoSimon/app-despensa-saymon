## MODIFIED Requirements

### Requirement: Wholesale Order Entity
The system SHALL store wholesale orders.

#### Scenario: Wholesale order is persisted
- **WHEN** a wholesale order is created
- **THEN** the system stores id, wholesale user id, order date, desired delivery date, optional assigned delivery date, status, total, optional comment, optional rejection reason, creation timestamp, and update timestamp
- **AND** status is one of `pendiente`, `confirmado`, `entregado`, or `rechazado`

### Requirement: Wholesale Order Item Entity
The system SHALL store immutable wholesale order item snapshots.

#### Scenario: Wholesale order item is persisted
- **WHEN** a wholesale order item is created
- **THEN** the system stores order id, product id, product name snapshot, quantity, unit price, subtotal, and whether special price was applied
