## MODIFIED Requirements

### Requirement: Protected Role Routes

The app SHALL expose protected routes according to user role.

#### Scenario: User is redirected from unauthorized route
- **WHEN** an authenticated user opens a route outside their allowed role area
- **THEN** the app redirects the user to their role home instead of rendering that area
