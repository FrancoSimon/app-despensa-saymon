## MODIFIED Requirements

### Requirement: Product Identity
The system SHALL present itself as SAYMON, a web application for managing pantry/store operations.

#### Scenario: User lands on the application
- **WHEN** a user opens the main application route
- **THEN** the experience identifies the product as SAYMON
- **AND** the user can understand that the application supports sales, products, stock, and wholesale orders
- **AND** the application no longer presents default Next.js starter content

### Requirement: Visual Brand
The system SHALL use the SAYMON brand identity as the primary visual reference.

#### Scenario: User sees branded surfaces
- **WHEN** the application displays login, dashboard, or ticket surfaces
- **THEN** the visual design can use the SAYMON logo style: black base, high-contrast neon green, bold geometric lettering, and circular mark

#### Scenario: User opens login or protected shell
- **WHEN** the user sees authentication or role navigation surfaces
- **THEN** the interface applies a restrained black, white, and neon green SAYMON visual system
