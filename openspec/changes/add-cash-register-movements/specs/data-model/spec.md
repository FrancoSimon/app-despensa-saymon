## ADDED Requirements

### Requirement: Cash Register Movements

The system SHALL store manual cash register movements independently from sales.

#### Scenario: Movement is recorded
- **WHEN** an authorized seller registers an income or withdrawal for an open cash register
- **THEN** the system stores the cash register id, operator id, movement type, amount, reason, and timestamp
