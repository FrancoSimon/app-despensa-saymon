## MODIFIED Requirements

### Requirement: Admin Sale Review

Admins SHALL be able to review active and canceled counter sales with status and date range filters.

#### Scenario: Admin filters canceled sales by date
- **WHEN** an admin opens `/admin/ventas?estado=anulada&desde=2026-06-01&hasta=2026-06-06`
- **THEN** the system shows canceled counter sales in that date range
- **AND** ticket links preserve the selected filters when returning

