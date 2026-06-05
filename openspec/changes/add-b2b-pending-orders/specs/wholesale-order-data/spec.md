## ADDED Requirements

### Requirement: Wholesale Order Tables
The system SHALL persist wholesale orders and order items.

#### Scenario: Wholesale order is created
- **WHEN** a wholesale user submits an order
- **THEN** the system stores an order row with wholesale user, order date, desired delivery date, status `pendiente`, total, and optional comment
- **AND** stores item rows with product, product name snapshot, quantity, unit price, and subtotal

### Requirement: Pending Order RPC
The system SHALL create pending wholesale orders through a secure database function.

#### Scenario: Valid pending order
- **WHEN** a wholesale user submits valid items and a valid Saturday delivery date
- **THEN** the function creates the order and items
- **AND** does not update product stock

#### Scenario: Invalid pending order
- **WHEN** items are invalid, products are not wholesale-enabled, or delivery date violates Saturday cutoff rules
- **THEN** the function rejects the order
- **AND** does not insert order rows
