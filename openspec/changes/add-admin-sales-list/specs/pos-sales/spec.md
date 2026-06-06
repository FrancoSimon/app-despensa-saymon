## ADDED Requirements

### Requirement: Admin Sale Review

Admins SHALL be able to review active and canceled counter sales.

#### Scenario: Admin filters canceled sales
- **WHEN** an admin opens `/admin/ventas?estado=anulada`
- **THEN** the system shows canceled counter sales
- **AND** each row shows date, seller, payment method, total, cancellation reason, and ticket link

