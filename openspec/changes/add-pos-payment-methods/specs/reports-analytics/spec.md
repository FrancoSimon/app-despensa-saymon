## MODIFIED Requirements

### Requirement: Admin Indicator Dashboard
The system SHALL provide admin dashboard indicators.

#### Scenario: Admin opens dashboard
- **WHEN** an admin opens the dashboard
- **THEN** the system shows low-stock product count
- **AND** pending wholesale order count
- **AND** today's sales total
- **AND** links to the detailed reports page

### Requirement: Payment Method Totals
The reports page SHALL show payment totals by method group.

#### Scenario: Admin opens reports
- **WHEN** an admin views sales reports
- **THEN** the system shows totals for efectivo, QR, tarjetas, and transferencia
