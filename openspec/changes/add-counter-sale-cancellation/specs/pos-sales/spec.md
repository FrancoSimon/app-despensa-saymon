## ADDED Requirements

### Requirement: Sale Cancellation

The POS SHALL allow authorized users to cancel an active counter sale without deleting the sale record.

#### Scenario: Authorized user cancels active sale
- **WHEN** an admin or seller cancels an active sale with a reason
- **THEN** the system marks the sale as canceled
- **AND** restores stock for every sale item
- **AND** stores stock entry movements linked to the sale
- **AND** keeps the ticket visible as canceled

#### Scenario: User cancels already canceled sale
- **WHEN** the sale is already canceled
- **THEN** the system blocks duplicate cancellation
- **AND** does not restore stock again

