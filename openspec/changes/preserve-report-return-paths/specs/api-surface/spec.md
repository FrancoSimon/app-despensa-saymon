## MODIFIED Requirements

### Requirement: Admin Return Navigation

The app SHALL preserve safe return paths when admin pages are opened from reports.

#### Scenario: Admin returns to reports after opening a linked page
- **WHEN** an admin opens sales, cash registers, or wholesale orders from reports
- **THEN** the linked page shows a back link to the originating reports period
- **AND** filter navigation on that linked page keeps the same return path
