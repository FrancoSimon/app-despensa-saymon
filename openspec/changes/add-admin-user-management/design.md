## Context

Supabase Auth owns credentials and `public.profiles` owns app role metadata. Creating an Auth user from the app requires a server-only service-role key.

## Decisions

1. Use `SUPABASE_SERVICE_ROLE_KEY` only in server modules.
   - Rationale: Supabase admin APIs require service role and must never run in the browser.

2. Keep password optional during edit.
   - Rationale: admins should not need to reset password every time they edit role/contact data.

3. Do not delete Auth users from the UI.
   - Rationale: deactivation preserves links to sales, orders, and audit history.

## Non-Goals

- Public self-registration.
- Email invitation templates.
- Password recovery flow customization.
