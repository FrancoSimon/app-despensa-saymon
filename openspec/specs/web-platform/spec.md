## Purpose

Capture the current technical platform and baseline constraints for the web application.

## Requirements

### Requirement: Next.js Application Platform
The system SHALL be implemented as a Next.js application using the App Router structure under `app/`.

#### Scenario: Developer changes a route
- **WHEN** a developer modifies a page or layout
- **THEN** the change is made within the App Router conventions used by this project

### Requirement: Local Next.js Documentation Check
The system SHALL treat the installed Next.js documentation as authoritative before making Next.js code changes.

#### Scenario: Developer changes Next.js code
- **WHEN** a change depends on Next.js APIs, routing, metadata, rendering, or configuration
- **THEN** the developer reads the relevant guide in `node_modules/next/dist/docs/` before implementation

### Requirement: TypeScript and React Baseline
The system SHALL use TypeScript with React for application code.

#### Scenario: Developer adds application logic
- **WHEN** new React components, pages, layouts, or helpers are added
- **THEN** they are written in TypeScript-compatible files and follow the existing project conventions

### Requirement: Tailwind CSS Styling
The system SHALL use Tailwind CSS as the primary styling system.

#### Scenario: Developer styles user interface
- **WHEN** UI styling is added or modified
- **THEN** Tailwind utility classes or project-level Tailwind theme tokens are preferred over ad hoc styling

### Requirement: Standard Project Scripts
The system SHALL expose standard scripts for local development, production build, serving, and linting.

#### Scenario: Developer verifies the project
- **WHEN** the developer needs to run the app or verify code quality
- **THEN** they can use `npm run dev`, `npm run build`, `npm run start`, and `npm run lint`

### Requirement: Supabase Backend
The system SHALL use Supabase as the backend platform for authentication, PostgreSQL data storage, and product image storage.

#### Scenario: Developer implements persistence
- **WHEN** application data needs to be stored
- **THEN** it is persisted in Supabase PostgreSQL
- **AND** access rules account for admin, seller, and wholesale roles

#### Scenario: Developer implements authentication or media storage
- **WHEN** authentication is needed
- **THEN** Supabase Auth is used
- **AND** product images are stored in Supabase Storage
