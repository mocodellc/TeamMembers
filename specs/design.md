# Technical Design

## Metadata

- Feature name: Team Directory
- Scope: Full-Stack
- Related spec: specs/spec.md
- Owner: Senior Fullstack Developer
- Date: 2026-06-15
- Status: In Progress

## Architecture Approach by Scope

### Frontend-Only

- UI/component changes:
  - [x] Members table view with inline editor row and action controls
  - [x] Groups management view
- State management changes:
  - [x] Pinia stores for members and groups

### Backend-Only

- API/domain changes:
  - [x] Controllers + service layer for members and groups
  - [x] DTO contracts for request/response isolation
- Persistence changes:
  - [x] EF Core entities with SQLite DbContext and seeding

### Full-Stack

- Contract alignment strategy:
  - [x] Shared shape parity between backend DTOs and frontend TypeScript interfaces with camelCase JSON policies

## Components and Modules to Change

- backend/Program.cs: Register DbContext, services, CORS, controllers, and startup seed execution
- backend/Data/AppDbContext.cs: Define EF Core model, table naming, relationship mapping, and constraints
- backend/Data/DbSeeder.cs: Seed groups and members with relationship assignments
- backend/Domain/TeamMember.cs: Member persistence entity and audit fields
- backend/Domain/TeamGroup.cs: Group persistence entity
- backend/Domain/TeamMemberGroup.cs: Many-to-many join entity
- backend/Services/TeamMemberService.cs: Member CRUD, includeDeleted filtering, soft delete/undelete workflow
- backend/Services/TeamGroupService.cs: Group CRUD and conflict validation
- backend/Controllers/TeamMembersController.cs: Members API routes and status handling
- backend/Controllers/TeamGroupsController.cs: Groups API routes and status handling
- backend/Database/team-directory-schema.sql: Raw SQLite DDL script
- backend/Database/team-directory-seed.sql: Raw seed script for groups/members/joins
- frontend/src/router/index.ts: members/groups routes
- frontend/src/stores/membersStore.ts: Members state and API orchestration
- frontend/src/stores/groupsStore.ts: Groups state and API orchestration
- frontend/src/api/teamDirectoryApi.ts: Typed API boundary and typed error handling
- frontend/src/views/MembersView.vue: Table + action column + includeDeleted + create/edit UX
- frontend/src/views/GroupsView.vue: Group management UX
- frontend/src/components/MemberDetailsEditor.vue: Save/cancel member form for create/edit
- frontend/src/mocks/createMockSeedData.ts: Faker mock data generator for sample records
- frontend/src/main.ts and App.vue: Pinia/router bootstrap and shell layout
- frontend/tailwind.config.ts + postcss.config.js + src/style.css: Tailwind setup

## API and State-Flow Design

### Request Flow

1. Members view toggles includeDeleted checkbox and dispatches membersStore.loadMembers(includeDeleted).
2. Store calls typed teamDirectoryApi.getMembers(includeDeleted) and stores loading/error/data states.
3. Create/edit/delete/undelete actions call corresponding store methods, then refresh member list while preserving includeDeleted filter.

### Response Flow

1. Backend services map entities to DTO responses, including assigned groups and audit timestamps.
2. Frontend store updates state and view renders loading/empty/error/success conditions.

### Frontend State Model

- Loading state: Per-view loading booleans disable controls and show status banners.
- Empty state: Explicit message when lists return zero rows.
- Error state: API/store error text rendered in alert containers.
- Success state: Success message shown after create/update/delete/undelete actions.

## Data Model and Mapping Rules

- Local datastore default:
  - [x] SQLite via EF Core unless explicitly overridden by requirements
- Persistence design:
  - DbContext: AppDbContext
  - SQLite database file: backend/team-directory.db
  - Migrations strategy: EnsureCreated at startup for local workflow with reference SQL scripts for DDL and seed.
- DTOs/interfaces:
  - [x] Request DTO/interface defined
  - [x] Response DTO/interface defined
- Mapping rules:
  - TeamMember -> TeamMemberResponseDto (includes group summaries)
  - TeamGroup -> TeamGroupResponseDto
  - TeamMemberUpsertRequestDto -> TeamMember with join table replacement

## Risks and Mitigations

| Risk                                   | Impact | Mitigation                                                                             |
| -------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| Inline editor state leaks between rows | Medium | Keep a single active editor state keyed by member ID and reset draft on cancel/success |
| Soft-delete filter confusion           | Medium | Preserve includeDeleted flag in store and wire it into every reload                    |
| Group delete on referenced members     | High   | Block delete with 409 conflict when active references exist                            |
| SQLite schema drift from runtime model | Medium | Keep SQL scripts aligned with EF model and validate via startup seeding                |

## Test Strategy

### Unit Tests

- [x] Backend service logic is designed for isolated unit testing with interfaces
- [x] Frontend store API boundaries are isolated for Vitest mocking

### Integration/API Tests

- [x] Endpoints expose explicit routes and status codes suitable for integration checks
- [x] SQLite relational behavior supports realistic local API validation

### UI/Component Tests

- [x] Members view state transitions (loading/empty/error/success) and inline editor behavior can be covered with Vitest + Vue Test Utils
- [x] Groups view create/edit/delete behavior can be covered with store-mocked tests

## Traceability Back to Spec

Map design decisions to each AC.

| AC ID  | Design Decision                                             | Notes                                                        |
| ------ | ----------------------------------------------------------- | ------------------------------------------------------------ |
| AC-001 | Full-stack split into API service layer + routed SPA client | Enforces clear boundary between persistence and presentation |
| AC-002 | Vite + Vue 3 + TS + Pinia + Tailwind integration            | Meets required frontend toolchain                            |
| AC-003 | ASP.NET Core controllers/services with EF Core SQLite       | Meets required backend toolchain                             |
| AC-004 | Faker-powered frontend seed generator utility               | Satisfies frontend sample data generation requirement        |
| AC-005 | Mandatory artifact pattern maintained under specs           | Blueprint compliance                                         |
| AC-006 | Members route table rendering via members store             | View-all behavior                                            |
| AC-007 | Member CRUD endpoints and UI actions                        | End-to-end CRUD                                              |
| AC-008 | Audit fields managed in service layer per action            | Lifecycle timestamp correctness                              |
| AC-009 | Explicit TeamMemberGroup join with unique index             | Many-to-many integrity                                       |
| AC-010 | Checked-in DDL and seed SQL scripts                         | Script/schema parity                                         |
| AC-011 | Router has /members and /groups                             | Route compliance                                             |
| AC-012 | includeDeleted query param from checkbox                    | Filtered API read behavior                                   |
| AC-013 | Slide-down inline editor row component with cancel rollback | In-place editing UX                                          |
