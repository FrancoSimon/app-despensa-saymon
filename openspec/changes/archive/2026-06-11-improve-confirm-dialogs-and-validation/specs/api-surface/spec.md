## ADDED Requirements

### Requirement: In-App Confirmation Dialogs
Critical actions SHALL use styled in-app confirmation dialogs instead of browser-native confirm dialogs.

#### Scenario: Admin confirms critical action
- **WHEN** an admin attempts a critical action such as confirming, rejecting, delivering, canceling a wholesale order, or closing a cash register
- **THEN** the app shows an in-app dialog with action-specific title, message, cancel action, and confirm action

### Requirement: Inline Validation Feedback
Forms SHALL show validation feedback inside the app UI instead of relying on browser-native validation bubbles for supported forms.

#### Scenario: User submits an incomplete supported form
- **WHEN** a user submits a supported form with missing or invalid required values
- **THEN** the app shows a clear inline validation message near the related field or action
