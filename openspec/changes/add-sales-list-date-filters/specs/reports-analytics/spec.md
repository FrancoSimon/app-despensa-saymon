## MODIFIED Requirements

### Requirement: Sales Summary

The system SHALL show sales summary metrics for active sales in a selected date range and provide navigation to canceled counter sales for that same date range.

#### Scenario: Admin opens canceled sales from reports
- **WHEN** the report shows canceled counter sales for a selected date range
- **THEN** the canceled sales count links to `/admin/ventas` with `estado=anulada`, `desde`, and `hasta`

