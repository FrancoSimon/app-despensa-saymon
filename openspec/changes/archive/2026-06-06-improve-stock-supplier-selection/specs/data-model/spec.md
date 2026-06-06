## ADDED Requirements

### Requirement: Supplier Entity
The system SHALL store supplier data for stock purchases.

#### Scenario: Supplier is persisted
- **WHEN** a supplier is created during stock purchase registration
- **THEN** the system stores name, optional phone, email, CUIT/document, VAT condition, address, locality, contact person, notes, active flag, and timestamps
