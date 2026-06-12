## Overview

Introduce a small client wrapper around `<form>` that receives the same Server Action used by existing forms. It intercepts submit, calls `reportValidity()`, opens the existing `ConfirmDialog`, and only then calls `requestSubmit()` to execute the Server Action.

## Decisions

- Use one reusable `ConfirmedActionForm` component to avoid repeating ref/submit confirmation logic.
- Keep validation behavior intact by checking native validity before opening the dialog.
- Scope usage to forms where accidental submission changes stock, cash, customer debt, or sale/product status.
- Leave search/filter forms and simple navigation untouched.

## Risks

- Server Actions passed into a client component must remain form-action compatible. The project already uses this pattern in client forms.
- If a future form replaces native required validation with inline validation, the wrapper may need an optional validation callback.
