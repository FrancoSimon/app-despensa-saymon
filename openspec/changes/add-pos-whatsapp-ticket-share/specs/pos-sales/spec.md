## MODIFIED Requirements

### Requirement: Internal Ticket PDF
The POS SHALL generate a downloadable, printable, and shareable internal ticket after sale completion.

#### Scenario: Ticket is generated
- **WHEN** a sale is completed
- **THEN** the ticket includes SAYMON, date, time, sale number, items, quantities, unit prices, subtotals, discount, surcharge, total, and payment method
- **AND** the seller can open a print-optimized ticket and use the browser print dialog to print or save as PDF
- **AND** the seller can send a formatted ticket summary through WhatsApp
- **AND** the ticket is an internal sales record, not a fiscal or legal invoice
