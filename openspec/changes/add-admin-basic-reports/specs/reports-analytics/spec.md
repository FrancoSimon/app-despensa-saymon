## MODIFIED Requirements

### Requirement: Admin Indicator Dashboard
The system SHALL provide admin dashboard indicators.

#### Scenario: Admin opens dashboard
- **WHEN** an admin opens the dashboard
- **THEN** the system shows low-stock product count
- **AND** pending wholesale order count
- **AND** today's sales total
- **AND** links to the detailed reports page

### Requirement: Best Selling Products Report
The system SHALL provide a best-selling products report.

#### Scenario: Admin requests best sellers
- **WHEN** an admin selects a date range
- **THEN** the system lists products with sold quantity and total amount
- **AND** sorts results by sold quantity descending
- **AND** allows CSV export

### Requirement: Grouped Sales Report
The system SHALL provide grouped sales reporting.

#### Scenario: Admin groups sales by day
- **WHEN** an admin selects a date range
- **THEN** the system displays daily sale count and total amount

### Requirement: Operational Stock And Order Indicators
The system SHALL provide supporting operational indicators in reports.

#### Scenario: Admin opens reports
- **WHEN** an admin opens the reports page
- **THEN** the system shows low-stock products
- **AND** wholesale order counts by status
