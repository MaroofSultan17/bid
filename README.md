# TaskBid

TaskBid is a real-time collaborative task auction system where team members bid on tasks. The task is intelligently assigned to the lowest bidder who still has capacity.

**Live URL:** [Insert Deployed URL Here]

## Features
- **Kanban Task Board:** Group tasks by status with complexity indicators.
- **Intelligent Auto-Assignment:** Atomic assignment logic with race condition protection.
- **Real-Time Updates:** SSE-powered bid lists and dashboard metrics.
- **Capacity Management:** Prevents users from over-committing.
- **Audit Logging:** Database-level tracking of all state changes.
- **Interactive Dashboard:** Visual insights using Recharts.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, Knex (Query Builder), PostgreSQL, Redis, Bull (Queues), Nodemailer.
- **Frontend:** React, Vite, TanStack Query, Zustand, Tailwind CSS, Recharts.
- **Infrastructure:** Docker, Nginx.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### Local Setup
1. Clone the repository.
2. Run the entire stack:
   ```bash
   docker-compose up --build
   ```
3. Run migrations and seed data (in a new terminal):
   ```bash
   # In apps/backend
   npm run migrate
   npm run seed
   ```
4. Access the app:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001/api`

## Architecture Decisions
Detailed explanations for concurrency handling, stale bids, and audit logging can be found in [DECISIONS.md](./DECISIONS.md).

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id/status` | Advance task status |
| POST | `/api/tasks/:id/bids` | Place a bid |
| GET | `/api/tasks/:id/bids` | Get all bids for a task |
| POST | `/api/tasks/:id/assign` | Auto-assign task |
| GET | `/api/users/:id/workload` | Get user capacity |
| GET | `/api/dashboard/stats` | Aggregated metrics |

## Deployment
This project is configured for easy deployment to **Render** (Backend/DB) and **Vercel** or **Render Static** (Frontend).
- Multi-stage Dockerfiles are provided for production-ready builds.
- Nginx is used to serve the frontend SPA.
