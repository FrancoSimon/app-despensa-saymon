## Context

The app already authenticates with Supabase Auth and loads role information from a `profiles` table. The remote Supabase project details are configured in `.env.local`, but a publishable key cannot create tables, bypass RLS, or create an admin Auth user.

## Goals / Non-Goals

**Goals:**

- Define `public.app_role` enum and `public.profiles` table.
- Link profiles to `auth.users` through `auth_user_id`.
- Enable RLS for safe profile reads and admin management.
- Document first-admin creation clearly.

**Non-Goals:**

- Automating remote migration application without Supabase service credentials.
- Building product, POS, wholesale, or report data models.
- Implementing an in-app public registration flow.

## Decisions

1. Use a `profiles` table instead of Auth metadata only.
   - Rationale: business roles, locality, and phone are application data and will grow over time.

2. Use an enum `public.app_role`.
   - Rationale: keeps roles constrained to `admin`, `vendedor`, and `mayorista`, matching OpenSpec and app code.

3. Use admin policy with an `exists` check on the current user's profile.
   - Rationale: after the first admin exists, admins can manage future profiles without service-role access.

## Risks / Trade-offs

- First admin bootstrapping cannot be done through RLS alone -> use Supabase Dashboard SQL editor or service role for the initial insert.
- If email confirmation is enabled, login will not complete until the admin user is confirmed -> confirm the user in Supabase Auth before testing.
- Admin policy depends on the initial admin profile existing -> keep setup docs close to the migration.

## Open Questions

- The first admin email/password still needs to be chosen in Supabase Auth.
