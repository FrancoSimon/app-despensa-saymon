## MODIFIED Requirements

### Requirement: Pending Orders List
Admins SHALL see all pending wholesale orders.

#### Scenario: Admin opens pending orders
- **WHEN** an admin opens the pending orders view
- **THEN** the system shows a table or grouped list with customer, order date, desired delivery date, total, comment, and item details
- **AND** orders are sorted by oldest order date first
- **AND** each row or card provides confirm and reject actions

### Requirement: Confirm Order With Stock Verification
Admin order confirmation SHALL verify stock before deducting stock and changing state.

#### Scenario: Admin confirms with enough stock
- **WHEN** all order items have enough available stock
- **THEN** the system deducts stock for each product
- **AND** changes order status to `confirmado`
- **AND** assigns `fechaEntregaAsignada`

#### Scenario: Admin confirms without enough stock
- **WHEN** at least one order item lacks enough stock
- **THEN** the system shows a stock error
- **AND** does not confirm the order
- **AND** does not deduct stock

#### Scenario: Admin tries to confirm an already processed order
- **WHEN** the order status is not `pendiente`
- **THEN** the system rejects the confirmation
- **AND** does not modify stock

### Requirement: Reject Order Without Stock Impact
Admins SHALL be able to reject wholesale orders without modifying stock.

#### Scenario: Admin rejects order
- **WHEN** an admin selects reject and confirms the action
- **THEN** the system may collect a rejection reason
- **AND** changes order status to `rechazado`
- **AND** does not modify stock
