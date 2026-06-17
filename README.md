# Team Directory

A full-stack team directory application for managing team members and groups, built as a portfolio project demonstrating modern .NET and Vue 3 development practices.

---

## Overview

Team Directory provides a clean interface for maintaining a live staff directory. Users can create, edit, soft-delete, and restore team members; organise them into groups; and toggle a view between active and deleted records. All data is persisted to a local SQLite database via EF Core.

---

## Tech Stack

### Backend

| Technology            | Version               |
| --------------------- | --------------------- |
| ASP.NET Core Web API  | .NET 9                |
| Entity Framework Core | 9.x                   |
| SQLite                | via EF Core provider  |
| OpenAPI               | ASP.NET Core built-in |

### Frontend

| Technology      | Version |
| --------------- | ------- |
| Vue 3           | 3.5     |
| Vite            | 8.x     |
| TypeScript      | 6.x     |
| Tailwind CSS    | 3.x     |
| Pinia           | 3.x     |
| Vue Router      | 4.x     |
| @faker-js/faker | 9.x     |

---

## Features

- **Member management** — Create, edit, soft-delete, and restore team members with full audit timestamps
- **Group management** — Create and edit named groups with descriptions
- **Group assignment** — Assign members to multiple groups through the member editor
- **Soft delete / restore** — Deleted members are retained in the database and can be restored; toggle between active-only and deleted-only views
- **Demo-ready data entry** — "Create New Member" pre-fills the form with realistic faker data for quick demos
- **Audit info panel** — Created, Last Edit, and Deleted timestamps are shown in the member editor panel
- **Responsive layout** — Tailwind-powered dark UI that adapts to different screen widths

---

## Project Structure

```
TeamMembers/
├── backend/                    # ASP.NET Core Web API
│   ├── Controllers/            # REST API controllers
│   ├── Services/               # Business logic layer
│   ├── Domain/                 # EF Core entity models
│   ├── Contracts/              # Request/response DTOs
│   ├── Data/                   # DbContext and database seeder
│   └── Database/               # SQL DDL and seed scripts
├── frontend/                   # Vue 3 + Vite SPA
│   └── src/
│       ├── views/              # Page-level components (Members, Groups)
│       ├── components/         # Reusable UI components
│       ├── stores/             # Pinia state stores
│       ├── api/                # Typed API client functions
│       ├── types/              # Shared TypeScript interfaces
│       ├── router/             # Vue Router configuration
│       └── mocks/              # Faker-based mock data generator
└── specs/                      # Project specification and design documents
```

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) and [pnpm](https://pnpm.io/)

### 1. Run the backend

```bash
cd backend
dotnet run
```

The API will start on `http://localhost:5285`. On first run it auto-creates the SQLite database and seeds initial data.

### 2. Run the frontend (dev mode with hot reload)

```bash
cd frontend
pnpm install
pnpm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Build and preview (production mode)

```bash
cd frontend
pnpm run start
```

This runs a full TypeScript + Vite build and serves the output via Vite preview at `http://localhost:4173`.

---

## API Endpoints

### Team Members

| Method   | Path                             | Description                                                 |
| -------- | -------------------------------- | ----------------------------------------------------------- |
| `GET`    | `/api/TeamMembers`               | List members. Pass `?includeDeleted=true` for deleted-only. |
| `GET`    | `/api/TeamMembers/{id}`          | Get a single member by ID                                   |
| `POST`   | `/api/TeamMembers`               | Create a new member                                         |
| `PUT`    | `/api/TeamMembers/{id}`          | Update an existing member                                   |
| `DELETE` | `/api/TeamMembers/{id}`          | Soft-delete a member                                        |
| `POST`   | `/api/TeamMembers/{id}/undelete` | Restore a soft-deleted member                               |

### Team Groups

| Method   | Path                   | Description              |
| -------- | ---------------------- | ------------------------ |
| `GET`    | `/api/TeamGroups`      | List all groups          |
| `GET`    | `/api/TeamGroups/{id}` | Get a single group by ID |
| `POST`   | `/api/TeamGroups`      | Create a new group       |
| `PUT`    | `/api/TeamGroups/{id}` | Update an existing group |
| `DELETE` | `/api/TeamGroups/{id}` | Delete a group           |

---

## Design Decisions

- **Soft delete** — Members are never permanently removed; a `DeletedDate` timestamp marks them as deleted. The API returns either active or deleted-only records depending on the `includeDeleted` flag, keeping filtering at the data layer rather than the client.
- **Audit timestamps** — `CreatedDate`, `LastEditDate`, and `DeletedDate` are managed server-side and surfaced as read-only labels in the editor panel, not as editable fields.
- **Faker pre-fill** — The "Create New Member" button populates the form with realistic fake data to support live demos without manual typing.
- **Service layer** — Business logic sits in dedicated service classes rather than directly in controllers, keeping the API surface thin.
