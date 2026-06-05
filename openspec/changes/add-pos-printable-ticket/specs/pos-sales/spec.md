## MODIFIED Requirements

### Requirement: Internal Ticket PDF
The POS SHALL generate a downloadable and printable internal PDF ticket after sale completion.

#### Scenario: Ticket is generated
- **WHEN** a sale is completed
- **THEN** the ticket includes SAYMON, date, time, sale number, items, quantities, unit prices, subtotals, discount, surcharge, total, and payment method
- **AND** the seller can open a print-optimized ticket and use the browser print dialog to print or save as PDF
- **AND** the ticket is an internal sales record, not a fiscal or legal invoice

#### Scenario: Seller reopens ticket
- **WHEN** a seller opens a stored sale ticket they are allowed to read
- **THEN** the system reconstructs the ticket from stored sale and item rows
