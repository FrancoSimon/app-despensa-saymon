## Why

The Supabase Auth shell needs an application profile table before login can route users to admin, seller, or wholesale areas. Without `profiles`, authenticated users cannot receive a SAYMON role and will remain in the pending-profile state.

## What Changes

- Add the initial Supabase PostgreSQL schema for app roles and `profiles`.
- Add RLS policies so users can read their own profile and admins can manage profiles.
- Add setup documentation for creating the first admin Auth user and matching profile.
- Keep product, POS, order, and report tables out of scope for this change.

## Capabilities

### New Capabilities

- `supabase-schema`: Checked-in Supabase SQL migration and setup conventions for the database layer.

### Modified Capabilities

- `auth`: Make the initial admin profile setup explicit so real login can resolve role routing.
- `data-model`: Define the concrete `profiles` database shape used by the app.

## Impact

- Affected files: `supabase/migrations/`, setup docs, OpenSpec artifacts.
- Affected systems: Supabase Auth, Supabase PostgreSQL, RLS policies.
- Manual setup: creating the first Auth user requires Supabase Dashboard/CLI/service-role access outside the publishable browser key.
