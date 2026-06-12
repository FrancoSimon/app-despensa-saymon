## MODIFIED Requirements

### Requirement: In-App Confirmation Dialogs
Critical actions SHALL use styled in-app confirmation dialogs instead of browser-native confirm dialogs.

#### Scenario: User submits critical mutation form
- **WHEN** a user submits a form that changes stock, cash, customer debt, product active state, or sale status
- **THEN** the app shows an in-app confirmation dialog before executing the mutation
- **AND** executes the mutation only after the user confirms

#### Scenario: Critical form is invalid
- **WHEN** a user submits an invalid critical mutation form
- **THEN** the app shows validation feedback before showing a confirmation dialog
