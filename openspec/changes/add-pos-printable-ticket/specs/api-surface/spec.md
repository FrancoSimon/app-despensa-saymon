## ADDED Requirements

### Requirement: Seller Sale Ticket Route
The app SHALL expose a route for printable counter-sale tickets.

#### Scenario: Seller opens ticket route
- **WHEN** an authorized seller or admin navigates to `/vendedor/ventas/{id}/ticket`
- **THEN** the app shows the printable internal ticket for that sale

#### Scenario: Unauthorized user opens ticket route
- **WHEN** a user without sale access opens the route
- **THEN** the app redirects or returns not found according to existing access control
