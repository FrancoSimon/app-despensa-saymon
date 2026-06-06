## ADDED Requirements

### Requirement: Admins can cancel confirmed wholesale orders

Admins SHALL be able to cancel confirmed wholesale orders before delivery without deleting the order record.

#### Scenario: Admin cancels confirmed order
- **WHEN** an admin cancels a confirmed wholesale order with a reason
- **THEN** the system restores stock for every order item
- **AND** stores stock entry movements linked to the order
- **AND** changes the order state to `cancelado`
- **AND** stores the cancellation reason

#### Scenario: Admin cancels non-confirmed order
- **WHEN** an admin tries to cancel a pending, rejected, canceled, or delivered order
- **THEN** the system blocks the cancellation
- **AND** does not modify stock

