## ADDED Requirements

### Requirement: Delivered Order RPC
The schema SHALL provide an admin-only RPC to mark confirmed wholesale orders delivered.

#### Scenario: Admin delivers confirmed order
- **WHEN** the RPC receives a confirmed wholesale order id from an admin
- **THEN** it updates the order status to `entregado`
- **AND** does not update product stock
