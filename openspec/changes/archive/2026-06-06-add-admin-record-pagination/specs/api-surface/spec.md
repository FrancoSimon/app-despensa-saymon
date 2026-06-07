## ADDED Requirements

### Requirement: Admin Record Pagination
Admin record list pages SHALL paginate results and preserve active filters.

#### Scenario: Admin navigates paginated records
- **WHEN** an admin opens a record list page with many records
- **THEN** the app shows only the selected page of records
- **AND** provides previous and next page links when available

#### Scenario: Pagination preserves filters
- **WHEN** an admin changes page while filters are active
- **THEN** the app keeps the existing filters in the pagination links
