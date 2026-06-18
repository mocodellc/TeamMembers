# Execution Plan

## Metadata

- Feature name: Team Directory
- Scope: Full-Stack
- Related spec: specs/spec.md
- Related design: specs/design.md
- Owner: Senior Fullstack Developer
- Date: 2026-06-17
- Status: Done

## Ordered Implementation Steps

1. [x] Define full spec/design/plan artifacts and AC traceability mappings.
2. [x] Implement backend domain model, DbContext, service layer, and API controllers for members/groups.
3. [x] Add SQLite schema and seed SQL scripts aligned with EF model.
4. [x] Integrate frontend stack requirements (Tailwind, Pinia, Vue Router, faker dependency).
5. [x] Build members view with table, action column, includeDeleted filter, and inline editor row.
6. [x] Build groups view with create/update/delete behavior.
7. [x] Add frontend typed API layer and stores to orchestrate all API calls and states.
8. [x] Validate via build commands and update progress/compliance results.
9. [x] Align member deleted-toggle behavior so API returns the requested subset (active-only vs deleted-only).
15. [x] Add backend.Tests xUnit project and frontend Vitest tests; all 52 tests pass.
10. [x] Refactor members/groups view logic into a shared composable and keep view scripts minimal.
11. [x] Improve member UX with editor audit labels, live row count indicator, and editor-state control disabling.
12. [x] Add root README project overview for GitHub landing presentation.
13. [x] Extract member editor behavior into a dedicated composable and standardize composables to const-arrow function style.
14. [x] Add unsaved-change safeguards: route-leave confirmation (members/groups) and member row-action lock while editing.

## File-by-File Change Plan

| File Path                                               | Change Type   | Description                                                        | Depends On   |
| ------------------------------------------------------- | ------------- | ------------------------------------------------------------------ | ------------ |
| backend/Program.cs                                      | Update        | Register services, EF Core SQLite, CORS, controllers, startup seed | Step 2       |
| backend/Data/AppDbContext.cs                            | Create        | EF model mapping, keys, relationships, constraints                 | Step 2       |
| backend/Data/DbSeeder.cs                                | Create        | Seed groups/members/join rows and audit fields                     | Step 2       |
| backend/Domain/TeamMember.cs                            | Create        | Member entity with audit fields                                    | Step 2       |
| backend/Domain/TeamGroup.cs                             | Create        | Group entity                                                       | Step 2       |
| backend/Domain/TeamMemberGroup.cs                       | Create        | Join entity for many-to-many                                       | Step 2       |
| backend/Contracts/\*.cs                                 | Create        | Request/response DTO contracts                                     | Step 2       |
| backend/Services/\*.cs                                  | Create        | Business orchestration and validation                              | Step 2       |
| backend/Controllers/\*.cs                               | Create        | Thin controller endpoints                                          | Step 2       |
| backend/Database/team-directory-schema.sql              | Create        | SQLite DDL script                                                  | Step 3       |
| backend/Database/team-directory-seed.sql                | Create        | Seed insert script                                                 | Step 3       |
| frontend/package.json                                   | Update        | Add router, pinia, faker, tailwind deps and scripts                | Step 4       |
| frontend/src/main.ts                                    | Update        | Bootstrap router/pinia                                             | Step 4       |
| frontend/src/style.css                                  | Update        | Tailwind directives and base app skin                              | Step 4       |
| frontend/tailwind.config.ts                             | Create        | Tailwind config                                                    | Step 4       |
| frontend/postcss.config.js                              | Create        | PostCSS config for Tailwind                                        | Step 4       |
| frontend/src/router/index.ts                            | Create        | Members/groups routes                                              | Step 4       |
| frontend/src/types/teamDirectory.ts                     | Create        | Typed frontend contracts                                           | Step 7       |
| frontend/src/api/teamDirectoryApi.ts                    | Create        | Typed API client and error wrapper                                 | Step 7       |
| frontend/src/stores/membersStore.ts                     | Create        | Members state/actions                                              | Step 7       |
| frontend/src/stores/groupsStore.ts                      | Create        | Groups state/actions                                               | Step 7       |
| frontend/src/composables/useTeamDirectoryViewModel.ts   | Create/Update | Shared view-model composable for members and groups                | Step 10      |
| frontend/src/composables/useMemberDetailsEditorModel.ts | Create/Update | Member editor composable for local form behavior and validation    | Step 13      |
| frontend/src/components/MemberDetailsEditor.vue         | Create/Update | Reusable create/edit form with composable-driven logic             | Step 5,13    |
| frontend/src/views/MembersView.vue                      | Create/Update | Members table/action UX + live row count + editor-safe controls    | Step 5,11,14 |
| frontend/src/views/GroupsView.vue                       | Create/Update | Groups CRUD UX using shared composable                             | Step 6,10    |
| frontend/src/mocks/createMockSeedData.ts                | Create        | Faker seed/mock utility                                            | Step 4       |
| frontend/src/App.vue                                    | Update        | App shell and nav                                                  | Step 4       |
| README.md                                               | Create/Update | Professional project overview and setup instructions               | Step 12      |
| specs/progress.md                                       | Create/Update | Track execution state and compliance                               | Step 8       |
| backend.Tests/backend.Tests.csproj                      | Create        | xUnit test project referencing backend + Moq + SQLite              | Step 15      |
| backend.Tests/Controllers/TeamGroupsControllerTests.cs  | Create        | Controller unit tests with mocked ITeamGroupService                | Step 15      |
| backend.Tests/Controllers/TeamMembersControllerTests.cs | Create        | Controller unit tests with mocked ITeamMemberService               | Step 15      |
| backend.Tests/Services/TeamGroupServiceTests.cs         | Create        | Service integration tests with SQLite in-memory AppDbContext       | Step 15      |
| frontend/vitest.config.ts                               | Create        | Vitest config with jsdom environment and Vue plugin                | Step 15      |
| frontend/src/stores/__tests__/groupsStore.spec.ts       | Create        | Pinia store unit tests for groupsStore actions and state           | Step 15      |
| frontend/src/stores/__tests__/membersStore.spec.ts      | Create        | Pinia store unit tests for membersStore actions and state          | Step 15      |

## Dependency and Sequencing Notes

- Technical dependencies:
  - [x] SQLite provider and EF Core packages installed when backend persistence is required
  - [x] Initial or updated EF Core migrations prepared when schema changes are required
  - [x] Vue router and Pinia must be installed before wiring app bootstrapping
  - [x] Tailwind requires postcss and autoprefixer configuration
- Execution order constraints:
  - [x] Apply or generate EF Core migrations before validating persistence-dependent behavior
  - [x] Backend contracts/services should exist before frontend API/store integration
  - [x] Router and shell wiring should precede view-level interactions

## Verification Steps

- [x] Build passes
- [ ] Lint passes
- [x] Tests pass (30 backend xUnit + 22 frontend Vitest)
- [x] Manual acceptance checks completed

## Definition of Done

- [x] All scoped AC items marked complete
- [x] Traceability tables updated in specs/spec.md
- [x] specs/progress.md reflects latest status
- [x] No unresolved blockers

## Handoff Notes

- Deployment impact: Low
- Rollback plan: Revert changed files and remove local SQLite file/team-directory database artifacts.
- Monitoring/alerts: Local development only; rely on API logs and browser console diagnostics.
