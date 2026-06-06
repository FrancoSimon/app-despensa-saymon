## MODIFIED Requirements

### Requirement: Customer Account Movement Entity
The system SHALL calculate customer current-account balances from debit and payment movements and expose ledger-ready data.

#### Scenario: Account ledger is calculated
- **WHEN** customer account movements are listed chronologically
- **THEN** each movement can be presented with a running balance after that movement
- **AND** debit movements increase balance while payment movements reduce balance
