## Purpose

Define how admins review, confirm, reject, and control stock impact for wholesale orders submitted by B2B customers.

## Requirements

### Requirement: Pending Orders List
Admins SHALL see all pending wholesale orders.

#### Scenario: Admin opens pending orders
- **WHEN** an admin opens the pending orders view
- **THEN** the system shows a table with local, order date, desired delivery date, total, and comment
- **AND** orders are sorted by oldest order date first
- **AND** each row provides confirm and reject actions

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

### Requirement: Reject Order Without Stock Impact
Admins SHALL be able to reject wholesale orders without modifying stock.

#### Scenario: Admin rejects order
- **WHEN** an admin selects reject
- **THEN** the system asks for confirmation
- **AND** may collect a rejection reason
- **AND** changes order status to `rechazado`
- **AND** does not modify stock
