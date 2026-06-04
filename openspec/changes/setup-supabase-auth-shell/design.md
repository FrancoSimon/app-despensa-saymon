## Context

The project is currently a fresh Next.js App Router application with OpenSpec requirements for SAYMON. The next step is to establish the shared app backbone: Supabase Auth, Supabase PostgreSQL profile lookup, protected route groups, and a branded shell for the three user roles.

Next.js 16 local docs note that `middleware.ts` is deprecated in favor of `proxy.ts`. Supabase's current SSR guidance recommends `@supabase/supabase-js` plus `@supabase/ssr`, separate browser/server clients, and a Proxy that refreshes auth cookies.

## Goals / Non-Goals

**Goals:**

- Configure Supabase SSR clients for browser, server, and Proxy contexts.
- Create a typed profile/role model for `admin`, `vendedor`, and `mayorista`.
- Protect role route prefixes and redirect anonymous users to `/login`.
- Provide login/logout mechanics and starter route pages for each role.
- Replace the default starter page with a SAYMON-branded entry and dashboard redirection.

**Non-Goals:**

- Creating the full Supabase SQL schema for products, sales, and orders.
- Implementing POS, product CRUD, wholesale cart, reports, or PDF ticket generation.
- Creating real production users or configuring a remote Supabase project.

## Decisions

1. Use `@supabase/ssr` instead of legacy auth helpers.
   - Rationale: Supabase's current docs recommend `@supabase/ssr` for Server-Side Auth and cookie handling.
   - Alternative considered: client-only Supabase Auth. Rejected because protected Server Components and route guards need server-side session awareness.

2. Use Next.js `proxy.ts` instead of `middleware.ts`.
   - Rationale: Next.js 16 docs rename Middleware to Proxy and mark `middleware` as deprecated.
   - Alternative considered: only page-level redirects. Rejected because Supabase recommends Proxy for token refresh and because route prefixes need early redirect behavior.

3. Store app roles in a `profiles` table linked to Supabase Auth user IDs.
   - Rationale: Supabase Auth owns credentials, while the application owns business role metadata.
   - Alternative considered: encode roles only in JWT metadata. Deferred because profile lookup is simpler to evolve for business data like locality and phone.

4. Keep the shell lightweight and server-rendered by default.
   - Rationale: App Router pages/layouts are Server Components by default, reducing client JavaScript. Only login/logout controls need client interactivity.

## Risks / Trade-offs

- Missing Supabase environment variables -> show configuration guidance instead of crashing the whole app where possible.
- Profile table not created yet -> authenticated users may land on a pending-profile state until database setup exists.
- Proxy cannot be the only authorization layer -> server actions and APIs must still validate user and role when implemented.
- Role lookup in Proxy may add request overhead -> acceptable for MVP; can optimize with custom claims later.

## Migration Plan

1. Add Supabase packages and environment example.
2. Add Supabase clients and auth/profile helpers.
3. Add `proxy.ts` with session refresh and route protection.
4. Add login/logout actions and role landing pages.
5. Validate OpenSpec and run lint/build.

Rollback: remove the new Supabase dependencies, `lib/supabase`, auth route pages, and `proxy.ts`; restore the prior root page.

## Open Questions

- Exact Supabase project URL and publishable key must be provided in `.env.local` before real login can work.
- SQL migration files for `profiles` and RLS will be handled in a follow-up change.
