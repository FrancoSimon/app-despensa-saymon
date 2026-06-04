## Why

SAYMON needs a reliable application backbone before product, POS, and wholesale workflows can be built. The foundation must establish Supabase Auth, role-aware access, shared persistence conventions, and a branded route shell that future modules can reuse.

## What Changes

- Add Supabase SSR integration for browser, server, and proxy contexts.
- Add environment variable documentation for Supabase URL and publishable key.
- Add route protection for `/admin/*`, `/vendedor/*`, and `/mayorista/*`.
- Add role-aware dashboard shells and placeholder landing pages for admin, seller, and wholesale users.
- Replace the default Next.js starter page with a SAYMON-branded entry experience and login surface.
- Keep this change focused on infrastructure and navigation; product/POS/order business workflows remain future changes.

## Capabilities

### New Capabilities

- `app-shell`: Branded route shell, role home pages, and authenticated navigation surfaces.

### Modified Capabilities

- `auth`: Implement Supabase Auth login/logout, session refresh, and route-level role protection.
- `web-platform`: Add concrete Supabase SSR dependencies, environment conventions, and Next.js Proxy usage.
- `product-foundation`: Replace starter page with SAYMON identity as the first visible application surface.

## Impact

- Affected code: `app/`, `lib/`, root `proxy.ts`, environment examples, package dependencies.
- Affected systems: Supabase Auth, Supabase PostgreSQL profile lookup, Supabase Storage conventions later.
- New dependencies: `@supabase/supabase-js` and `@supabase/ssr`.
