## MODIFIED Requirements

### Requirement: Counter Customer Entity
The system SHALL store optional customer records for counter sales.

#### Scenario: Counter customer is persisted
- **WHEN** a customer is saved
- **THEN** the system stores id, name, optional phone, optional email, optional business name, optional document type, optional document number, optional tax condition, optional address, optional locality, optional notes, active flag, and timestamps
