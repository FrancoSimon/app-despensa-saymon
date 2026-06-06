## Why

Partial payments in the current-account admin panel need to be clearer and safer. The payment form currently pre-fills the full debt, which can make a partial payment look like a total cancellation, and the account list needs search and better aligned cards.

## What Changes

- Keep partial payments visibly partial when the remaining balance is greater than zero.
- Avoid pre-filling the payment amount with the full balance.
- Add customer search to the current-account admin page.
- Align customer account cards with consistent information, balance, and payment controls.

## Impact

- Affected specs: api-surface, data-model
- Affected code: admin current-account page, payment ticket, account payment action
