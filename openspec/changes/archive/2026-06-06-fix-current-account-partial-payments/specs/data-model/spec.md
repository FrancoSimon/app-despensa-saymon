## MODIFIED Requirements

### Requirement: Customer Account Movement Entity
The system SHALL calculate customer current-account balances from debit and payment movements.

#### Scenario: Partial payment affects balance
- **WHEN** a payment movement is lower than the current account balance
- **THEN** the balance is reduced only by the payment amount
- **AND** remaining debt stays pending
