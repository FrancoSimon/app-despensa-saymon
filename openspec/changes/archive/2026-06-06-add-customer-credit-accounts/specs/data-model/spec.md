## ADDED Requirements

### Requirement: Customer Account Movement Entity
The system SHALL store customer current-account debit and payment movements.

#### Scenario: Account movement is persisted
- **WHEN** a current-account sale or payment is registered
- **THEN** the system stores id, customer id, admin/seller profile id, optional sale id, type, amount, payment method when applicable, note, and timestamp
- **AND** movement type is one of `venta` or `pago`
