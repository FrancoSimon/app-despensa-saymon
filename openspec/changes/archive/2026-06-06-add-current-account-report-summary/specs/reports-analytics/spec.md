## ADDED Requirements

### Requirement: Current Account Report Summary
The reports panel SHALL show current-account totals separately from cash-register totals.

#### Scenario: Admin reviews current-account report totals
- **WHEN** an admin opens the reports panel for a date range
- **THEN** the app shows current-account units sold during the period
- **AND** shows current-account sales amount during the period
- **AND** shows current-account payments registered during the period
- **AND** shows pending current-account debt

#### Scenario: Current-account totals stay separate from cash register
- **WHEN** current-account sales or payments exist
- **THEN** the reports panel presents them in a dedicated current-account block
- **AND** cash-register closing totals remain reported independently
