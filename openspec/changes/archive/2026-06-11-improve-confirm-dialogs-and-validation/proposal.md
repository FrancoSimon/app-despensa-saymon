## Why

Browser-native confirmation dialogs and validation bubbles feel disconnected from the SAYMON interface and can be unclear on mobile. Critical actions and form validation should use in-app messaging consistent with the design system.

## What Changes

- Add a reusable in-app confirmation dialog.
- Replace native confirmations in wholesale admin order actions and cash closing.
- Add inline validation messages for login fields.
- Add action-level validation messages for critical forms.

## Impact

- Affected specs: api-surface
- Affected code: confirmation UI, wholesale admin orders, cash register panel, login form
