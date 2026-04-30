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

1. **Clone the repository** and navigate to the root directory.
2. **Start the stack** in detached mode:
   ```bash
   docker-compose up -d --build
   ```
3. **Initialize the database** (Run migrations and seed data):
   ```bash
   # Run migrations
   docker exec -it buggcy-backend-1 npm run migrate

   # Seed the database with initial data
   docker exec -it buggcy-backend-1 npx ts-node src/core/db/seed.ts
   ```

4. **Access the Application**:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:3001/api](http://localhost:3001/api)
   - **Database**: Port `5432` (User: `taskbid`, Pass: `secret`)


## Technical Choices & Justifications

### 1. Real-Time Updates (SSE)
We chose **Server-Sent Events (SSE)** over WebSockets or Polling for several reasons:
- **Efficiency**: SSE provides a persistent connection for real-time updates without the overhead of constant HTTP requests (polling).
- **Simplicity**: Unlike WebSockets, SSE works over standard HTTP, making it easier to manage through proxies and load balancers.
- **Suitability**: Our use case is primarily unidirectional (server notifying clients about new bids or status changes). SSE is perfectly optimized for this pattern while handling automatic reconnection natively.

### 2. High-Scale Background Processing (Redis & Bull)
To ensure the system remains responsive under heavy load (e.g., hundreds of concurrent users bidding), we implemented a background job architecture:
- **Scalability**: Heavy operations like sending emails and notifying outbid users are offloaded to **Bull** (powered by **Redis**). This prevents blocking the main event loop and ensures fast API response times.
- **Reliability**: Background jobs provide automatic retries and failure handling, ensuring that critical notifications are delivered even if an external service (like SMTP) is temporarily down.

### 3. Database Integrity (Triggers & Row Locking)
- **Atomicity**: We use `SELECT ... FOR UPDATE` row-level locking during task assignment to prevent race conditions where multiple users might be over-assigned capacity simultaneously.
- **Business Logic Defense**: Core business rules (like no self-bidding and forward-only lifecycle) are enforced via **PostgreSQL Triggers**. This provides a final line of defense, ensuring data integrity even if application-level checks are bypassed.

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
