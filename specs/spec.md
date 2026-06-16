# Feature Specification

## Metadata

- Feature name: Team Directory
- Scope: Full-Stack
- Owner: Senior Fullstack Developer
- Date: 2026-06-15
- Status: In Progress

## Feature Summary

Build a Team Directory full-stack application where users manage team members and team groups with persistent local SQLite storage. The frontend provides routed pages for members and groups, in-row member editing, and soft-delete visibility toggling. The backend exposes typed ASP.NET Core API contracts over EF Core entities and maintains audit timestamps.

## In Scope

- [x] ASP.NET Core Web API for team member and team group CRUD, including soft-delete and undelete for members
- [x] SQLite + EF Core persistence with explicit schema naming and join table for many-to-many member/group mapping
- [x] Vue 3 + Vite + TypeScript + Tailwind + Pinia frontend with routes for members and groups
- [x] Include-deleted query behavior and member table action column with edit/delete/undelete actions
- [x] SQL DDL and seed scripts matching the model schema and relationship rules
- [x] Faker-based frontend mock/seed generation utility using @faker-js/faker

## Out of Scope

- [x] Authentication and authorization
- [x] Multi-tenant data partitioning
- [x] Server-side paging/sorting/filter API beyond includeDeleted
- [x] Production deployment pipeline and cloud database hosting

## User Story Interpretation

- As a Senior Fullstack software developer, I need a full-stack Team Member app with member/group management and persisted local data, so that I can manage a team directory with recoverable deletes and timestamped changes.
- Assumptions:
  - [x] SQLite database file is local to the backend project and auto-created on first run.
  - [x] Group assignment is editable while creating or updating a member.
  - [x] Showing deleted users is a frontend-controlled filter passed as includeDeleted to the members API.

## Acceptance Criteria Breakdown

Convert each AC into an atomic, testable item.

### AC-001: Full-stack solution is implemented

- [x] Preconditions: Backend and frontend projects exist in workspace.
- [x] Trigger/action: Build and run both projects.
- [x] Expected result: Frontend consumes backend APIs and persists data to SQLite.
- [x] Negative case(s): If backend unavailable, frontend shows an error state.

### AC-002: Frontend stack uses Vue 3, Vite, TypeScript, Tailwind CSS, and Pinia

- [x] Preconditions: Frontend package dependencies are installed.
- [x] Trigger/action: Inspect configs and runtime app wiring.
- [x] Expected result: Tailwind utilities power styling, Pinia manages shared state, Vite handles build/dev.
- [x] Negative case(s): Missing dependency produces build-time failure.

### AC-003: Backend stack uses ASP.NET Core, SQLite, and EF Core

- [x] Preconditions: Backend project references EF Core SQLite provider.
- [x] Trigger/action: Startup config initializes DbContext and controllers.
- [x] Expected result: API reads/writes SQLite via EF Core.
- [x] Negative case(s): Invalid Db path or migration errors surface startup/runtime errors.

### AC-004: Faker-based frontend simulated seed/mock data exists where sample records are needed

- [x] Preconditions: @faker-js/faker dependency is present.
- [x] Trigger/action: Run frontend mock seed generator utility.
- [x] Expected result: Utility produces 10 realistic member mock records and 4 groups.
- [x] Negative case(s): Faker generation exceptions are surfaced as typed errors.

### AC-005: Required blueprint output artifacts and order are followed

- [x] Preconditions: specs folder exists.
- [x] Trigger/action: Create spec, design, plan, implementation, progress artifacts.
- [x] Expected result: Files are present in required order and fully populated.
- [x] Negative case(s): Placeholder remnants are treated as non-compliant.

### AC-006: User can view all members in a Vue table

- [x] Preconditions: Members route is loaded.
- [x] Trigger/action: Members store loads member list from API.
- [x] Expected result: Tabular rows render with member and group details.
- [x] Negative case(s): Empty state message shown when no records exist.

### AC-007: User can CRUD each member and save

- [x] Preconditions: Members page loaded.
- [x] Trigger/action: Create, edit, save, and delete/undelete actions are invoked.
- [x] Expected result: API persists changes; UI refreshes state.
- [x] Negative case(s): Validation errors return and are shown without data corruption.

### AC-008: createdDate/lastEditDate/deletedDate lifecycle rules are applied

- [x] Preconditions: Member create/update/delete/undelete endpoints are called.
- [x] Trigger/action: Perform each lifecycle action.
- [x] Expected result: createdDate set on create; lastEditDate updates on edits; deletedDate set/cleared on delete/undelete.
- [x] Negative case(s): Soft-deleted records do not disappear when includeDeleted=true.

### AC-009: Team member to group many-to-many relationship with 4 seed groups

- [x] Preconditions: Database initialized.
- [x] Trigger/action: Read seed data and member-group associations.
- [x] Expected result: 4 groups exist and members can belong to many groups.
- [x] Negative case(s): Duplicate member-group assignments are prevented.

### AC-010: SQLite DDL and insert seed SQL scripts are provided and match schema

- [x] Preconditions: Database scripts path exists.
- [x] Trigger/action: Inspect schema and seed scripts.
- [x] Expected result: Scripts define tables, keys, relationships, and seed inserts aligned with model.
- [x] Negative case(s): Script/table mismatch identified as defect.

### AC-011: Frontend has members and groups routes

- [x] Preconditions: Router initialized.
- [x] Trigger/action: Navigate to /members and /groups.
- [x] Expected result: Corresponding views render.
- [x] Negative case(s): Unknown routes redirect to members.

### AC-012: Show/hide deleted checkbox controls includeDeleted API query

- [x] Preconditions: Members page loaded.
- [x] Trigger/action: Toggle show deleted checkbox.
- [x] Expected result: Members API request includes includeDeleted=true/false and UI updates.
- [x] Negative case(s): Request failure shows error and keeps toggle state.

### AC-013: Action column and inline slide-down member detail editor behavior

- [x] Preconditions: Members table row is visible.
- [x] Trigger/action: Click edit or create new member.
- [x] Expected result: Detail editor slides below row/top area with save and cancel behavior; no update on cancel.
- [x] Negative case(s): Invalid save shows validation error and retains form data.

## Data Contracts

Define request/response payloads and field-level constraints.

## Datastore Assumptions

- Default local project datastore: SQLite via EF Core unless the story or acceptance criteria explicitly require a different database technology.
- Database file path/name: backend/team-directory.db
- Migration strategy: EnsureCreated for local dev bootstrap with SQL scripts checked in as source-of-truth reference.

### Request Contract

```json
{
  "firstName": "Avery",
  "lastName": "Cole",
  "email": "avery.cole@example.com",
  "jobTitle": "Senior Engineer",
  "department": "Platform",
  "country": "US",
  "groupIds": [1, 2]
}
```

Rules:

- firstName: required, 1-80 chars
- lastName: required, 1-80 chars
- email: required, valid email, max 120 chars
- jobTitle: required, 1-120 chars
- department: required, 1-120 chars
- country: required, 2-80 chars
- groupIds: optional, unique positive integer IDs

### Response Contract

```json
{
  "teamMemberId": 1,
  "firstName": "Avery",
  "lastName": "Cole",
  "email": "avery.cole@example.com",
  "jobTitle": "Senior Engineer",
  "department": "Platform",
  "country": "US",
  "createdDate": "2026-06-15T12:00:00Z",
  "lastEditDate": "2026-06-15T13:00:00Z",
  "deletedDate": null,
  "groups": [
    {
      "teamGroupId": 1,
      "name": "Engineering"
    }
  ]
}
```

Rules:

- teamMemberId: positive integer
- createdDate: ISO-8601 UTC string, always present
- lastEditDate: ISO-8601 UTC string, nullable
- deletedDate: ISO-8601 UTC string, nullable
- groups: array of group summary DTOs

## Validation and Error Behavior

- Validation rules:
  - [x] Reject invalid/blank required fields with 400 and problem details payload.
  - [x] Return 404 when updating/deleting/undeleting nonexistent member/group.
  - [x] Prevent duplicate member-group rows via unique index.
- Error responses:
  - 400 Bad Request: Input contract validation failures.
  - 404 Not Found: Resource ID not located.
  - 409 Conflict: Duplicate group name conflict.
  - 500 Internal Server Error: Unhandled persistence or runtime failures.

## AC Traceability Table

| AC ID  | Spec Item(s)               | Design Section                       | Plan Step(s) | Implementation Ref                                                                            | Status    |
| ------ | -------------------------- | ------------------------------------ | ------------ | --------------------------------------------------------------------------------------------- | --------- |
| AC-001 | Scope, in-scope            | Architecture Approach by Scope       | 1-8          | Backend and frontend solution slices                                                          | Completed |
| AC-002 | AC-002 breakdown           | Components and Modules; State Model  | 4-8          | frontend/package.json, frontend/src/main.ts                                                   | Completed |
| AC-003 | AC-003 breakdown           | Data Model and Mapping Rules         | 2-3          | backend/Program.cs, backend/Data/AppDbContext.cs                                              | Completed |
| AC-004 | AC-004 breakdown           | Frontend State Model                 | 4, 7         | frontend/src/mocks/createMockSeedData.ts                                                      | Completed |
| AC-005 | Feature artifacts sections | Traceability Back to Spec            | 1            | specs/spec.md, specs/design.md, specs/plan.md, specs/progress.md                              | Completed |
| AC-006 | AC-006 breakdown           | API and State-Flow Design            | 5            | frontend/src/views/MembersView.vue                                                            | Completed |
| AC-007 | AC-007 breakdown           | Components and Modules; Request Flow | 3, 5         | backend/Controllers/TeamMembersController.cs, frontend/src/components/MemberDetailsEditor.vue | Completed |
| AC-008 | AC-008 breakdown           | Data model lifecycle mapping         | 2-3, 5       | backend/Services/TeamMemberService.cs                                                         | Completed |
| AC-009 | AC-009 breakdown           | Data Model and Mapping Rules         | 2-3          | backend/Domain/TeamMemberGroup.cs, backend/Data/DbSeeder.cs                                   | Completed |
| AC-010 | AC-010 breakdown           | Persistence design                   | 2, 8         | backend/Database/team-directory-schema.sql, backend/Database/team-directory-seed.sql          | Completed |
| AC-011 | AC-011 breakdown           | Frontend modules and route flow      | 4-5          | frontend/src/router/index.ts                                                                  | Completed |
| AC-012 | AC-012 breakdown           | Request flow includeDeleted query    | 5            | frontend/src/stores/membersStore.ts, backend/Controllers/TeamMembersController.cs             | Completed |
| AC-013 | AC-013 breakdown           | UI state and component behavior      | 5-6          | frontend/src/views/MembersView.vue, frontend/src/components/MemberDetailsEditor.vue           | Completed |

## Open Questions

- [x] Should group deletion be soft-delete like members, or hard delete when no member references exist? Defaulted to hard delete with conflict guard.
- [x] Should the app support avatar/image upload for member demographics? Deferred and out of scope.
