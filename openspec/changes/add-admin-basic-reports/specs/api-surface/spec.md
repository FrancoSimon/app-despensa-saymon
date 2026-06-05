## ADDED Requirements

### Requirement: Admin Reports Route
The app SHALL expose an admin reports route.

#### Scenario: Admin opens reports
- **WHEN** an admin navigates to `/admin/reportes`
- **THEN** the app shows sales, stock, and wholesale order indicators

#### Scenario: Non-admin opens reports
- **WHEN** a non-admin navigates to `/admin/reportes`
- **THEN** the app redirects according to existing admin route protection
