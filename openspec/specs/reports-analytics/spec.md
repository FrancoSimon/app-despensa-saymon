## Purpose

Define admin dashboards and reports for stock, orders, and sales.
## Requirements
### Requirement: Admin Indicator Dashboard
The system SHALL provide admin dashboard indicators.

#### Scenario: Admin opens dashboard
- **WHEN** an admin opens the dashboard
- **THEN** the system shows low-stock product count
- **AND** pending wholesale order count
- **AND** today's sales total
- **AND** may show a simple chart for sales from the last 7 days

### Requirement: Best Selling Products Report
The system SHALL provide a best-selling products report.

#### Scenario: Admin requests best sellers
- **WHEN** an admin selects a date range
- **THEN** the system lists products with sold quantity and total amount
- **AND** sorts results by sold quantity descending
- **AND** allows CSV export

### Requirement: Grouped Sales Report
The system SHALL provide grouped sales reporting.

#### Scenario: Admin groups sales
- **WHEN** an admin selects grouping by day, week, month, or category
- **AND** selects a date range
- **THEN** the system displays results as a table or bar chart

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
