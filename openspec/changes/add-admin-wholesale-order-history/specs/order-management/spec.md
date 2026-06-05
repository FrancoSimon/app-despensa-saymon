## ADDED Requirements

### Requirement: Admin Order History By Status
Admins SHALL be able to review wholesale orders by status.

#### Scenario: Admin filters orders by status
- **WHEN** an admin selects a status filter
- **THEN** the system shows orders matching that status
- **AND** supports pending, confirmed, delivered, rejected, and all orders

### Requirement: Mark Confirmed Order Delivered
Admins SHALL be able to mark confirmed wholesale orders as delivered.

#### Scenario: Admin marks order delivered
- **WHEN** an admin marks a confirmed order as delivered
- **THEN** the order status changes to `entregado`
- **AND** product stock is not modified

#### Scenario: Admin tries to deliver non-confirmed order
- **WHEN** the order status is not `confirmado`
- **THEN** the system rejects the transition
- **AND** product stock is not modified
