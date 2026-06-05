## Context

The printable ticket page already has all persisted sale details. WhatsApp supports opening a conversation composer with a prefilled text message through a URL.

## Decisions

1. Share formatted text, not a PDF attachment.
   - Rationale: browsers cannot attach generated print output to WhatsApp reliably without first generating and hosting a file.

2. Build the message on the server and pass it to a client button.
   - Rationale: formatting stays aligned with persisted ticket data while the client only opens WhatsApp.

3. Do not include customer phone selection yet.
   - Rationale: POS counter sales currently do not store customer phone numbers.

## Non-Goals

- WhatsApp Business API integration.
- Automatic PDF generation and file hosting.
- Customer contact management.
