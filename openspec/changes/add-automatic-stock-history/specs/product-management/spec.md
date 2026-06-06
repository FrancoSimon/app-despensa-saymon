## MODIFIED Requirements

### Requirement: Admins can review stock movement history

Admins SHALL be able to review recent stock movements, including manual adjustments and automatic stock exits caused by sales or wholesale order confirmations.

#### Scenario: Admin opens stock management
- **WHEN** an admin opens the stock page
- **THEN** the system shows recent stock movements sorted newest first
- **AND** each movement shows whether it came from a manual adjustment, counter sale, or wholesale order

