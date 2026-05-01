# TaskBid

TaskBid is a high-performance, real-time task auction and assignment platform. It intelligently matches tasks to the lowest bidder based on real-time capacity and complexity.

## 🚀 Key Features
- **Kanban Board:** Dynamic task grouping with complexity tracking.
- **Auto-Assignment:** Atomic logic with built-in race condition protection.
- **Real-Time Engine:** SSE-powered updates for bids and dashboard metrics.
- **Capacity Management:** Integrated checks to prevent over-allocation.
- **System Audit:** Comprehensive, paginated tracking of all state changes.
- **Visual Analytics:** Interactive dashboard for platform performance insights.

## 🛠 Tech Stack
- **Backend:** Node.js, Express, TypeScript, Knex, PostgreSQL, Redis, Bull.
- **Frontend:** React, Vite, TanStack Query, Zustand, Tailwind CSS, Recharts.
- **DevOps:** Docker, Docker Compose, Nginx.

## 🏁 Getting Started

### 1. Launch the Stack
```bash
docker-compose up -d --build
```

### 2. Initialize Database
```bash
# Run migrations
docker exec -it buggcy-backend-1 npm run migrate

# Seed initial data
docker exec -it buggcy-backend-1 npm run seed
```

### 3. Verification
Run the concurrency test to verify atomic assignment logic:
```bash
docker exec -it buggcy-backend-1 npm run test:race
```

## 🔗 Access Points
| Environment | Frontend URL | Backend API |
|-------------|--------------|-------------|
| **Production** | [http://taskbid.duckdns.org](http://taskbid.duckdns.org) | [http://taskbid.duckdns.org/api](http://taskbid.duckdns.org/api) |
| **Local Dev** | [http://localhost](http://localhost) | [http://localhost/api](http://localhost/api) |


---
*   **System Design**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
*   **Technical Q&A**: See [DECISIONS.md](./DECISIONS.md)
