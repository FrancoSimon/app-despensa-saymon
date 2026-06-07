## Why

Cash sales need an exact change helper before confirmation. The wholesale ordering panel should match the improved POS experience with faster search, keyboard shortcuts, mobile-friendly layout, and a clear confirmation step.

## What Changes

- Add cash received and change calculation when confirming cash counter sales.
- Show cash received/change on the internal sale confirmation ticket preview.
- Improve wholesale product search priority and keyboard entry.
- Add wholesale shortcuts for search, category, cart clearing, and order confirmation.
- Add a wholesale order confirmation modal before submitting.
- Keep wholesale server-side role and delivery-date validations in place.

## Impact

- Affected specs: api-surface
- Affected code: POS terminal, wholesale order terminal
