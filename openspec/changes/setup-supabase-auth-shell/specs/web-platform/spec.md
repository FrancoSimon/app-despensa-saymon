## MODIFIED Requirements

### Requirement: Supabase Backend
The system SHALL use Supabase as the backend platform for authentication, PostgreSQL data storage, and product image storage.

#### Scenario: Developer implements persistence
- **WHEN** application data needs to be stored
- **THEN** it is persisted in Supabase PostgreSQL
- **AND** access rules account for admin, seller, and wholesale roles

#### Scenario: Developer implements authentication or media storage
- **WHEN** authentication is needed
- **THEN** Supabase Auth is used through `@supabase/ssr` clients for browser, server, and Proxy contexts
- **AND** product images are stored in Supabase Storage

### Requirement: Next.js Application Platform
The system SHALL be implemented as a Next.js application using the App Router structure under `app/`.

#### Scenario: Developer changes a route
- **WHEN** a developer modifies a page or layout
- **THEN** the change is made within the App Router conventions used by this project

#### Scenario: Developer adds request-time auth handling
- **WHEN** request-time auth token refresh or route protection is needed
- **THEN** the implementation uses the Next.js 16 `proxy.ts` file convention rather than deprecated `middleware.ts`
