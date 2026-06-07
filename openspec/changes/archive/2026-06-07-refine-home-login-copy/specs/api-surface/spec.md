## ADDED Requirements

### Requirement: Single Entry Home Screen
The public home screen SHALL present one login entry and avoid exposing role-specific module shortcuts.

#### Scenario: Visitor opens home
- **WHEN** a visitor opens the home screen
- **THEN** the app shows a commerce welcome message
- **AND** provides a single login call to action
- **AND** does not show separate module labels under the logo

### Requirement: Motivational Login Copy
The login screen SHALL greet users with a motivational message instead of listing role modules.

#### Scenario: User opens login
- **WHEN** a user opens the login screen
- **THEN** the app shows a motivational welcome message for starting the work session
