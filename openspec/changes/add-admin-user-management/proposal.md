## Why

Admins currently need SQL or Supabase Dashboard access to create and manage app users. SAYMON needs an in-app admin workflow for sellers, wholesalers, and admins.

## What Changes

- Add `/admin/usuarios`.
- List profiles by role/status.
- Create Supabase Auth users and matching `profiles` rows.
- Edit profile data, role, active state, email, and optionally password.
- Add service-role environment configuration for server-only user administration.

## Capabilities

### Modified Capabilities

- `auth`: Add admin user/profile management.
- `api-surface`: Add admin user management routes.

## Impact

- Affected files: `app/admin/usuarios`, `components/users`, `lib/users`, `lib/supabase`, `.env.example`, OpenSpec artifacts.
- No database migration required.
