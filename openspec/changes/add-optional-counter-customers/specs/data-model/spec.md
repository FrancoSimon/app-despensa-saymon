## ADDED Requirements

### Requirement: Counter Customer Entity
The system SHALL store optional customer records for counter sales.

#### Scenario: Counter customer is persisted
- **WHEN** a customer is saved
- **THEN** the system stores id, name, optional phone, optional email, optional notes, active flag, and timestamps

## MODIFIED Requirements

### Requirement: Sale Entity
The system SHALL store counter sale transactions.

#### Scenario: Counter sale is persisted
- **WHEN** a sale is registered
- **THEN** the system stores id, seller user id, optional customer id, date, total, type `mostrador`, optional discount, and optional surcharge
