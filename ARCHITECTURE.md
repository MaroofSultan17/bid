# System Architecture & Design

This document describes the high-level architecture and system design of the TaskBid platform.

## 1. Overview
TaskBid is designed as a distributed system capable of handling high-concurrency task auctions. The architecture prioritizes data integrity, real-time feedback, and background processing for non-critical paths.

## 2. High-Level Architecture
The system consists of three main layers:
- **Frontend (Client)**: A React-based SPA that communicates with the backend via REST and receives updates via SSE.
- **Backend (API)**: A Node.js/Express service that handles business logic, orchestrates transactions, and manages background jobs.
- **Data & Infrastructure**: 
    - **PostgreSQL**: Primary relational database for persistence and data integrity constraints.
    - **Redis**: In-memory store used by Bull for the notification queue and SSE event state.

## 3. System Design Patterns

### 3.1. Event-Driven Real-Time Engine
Instead of polling, we use a custom **SSE (Server-Sent Events) Manager** in the backend. 
- When a task's status changes or a new bid is placed, the service layer publishes an event.
- The SSE Manager broadcasts this event to all connected clients (Global) or specific task-watchers.
- This ensures the UI remains synchronized without refreshing.

### 3.2. Background Job Processing (Bull + Redis)
To keep the API fast, operations that are not required for a successful response (e.g., sending emails) are pushed to a Redis-backed queue.
- **Producer**: The API service pushes notification jobs to the `notifications` queue.
- **Consumer**: A dedicated worker processes these jobs, ensuring reliability via automatic retries.

### 3.3. Database-Level Business Rules
We follow a "Thick Database" approach for critical invariants:
- **Triggers**: Enforce forward-only status transitions (`draft` -> `open` -> `done`).
- **Audit Logs**: Automatically capture every row change into an `audit_logs` table.
- **Row Locking**: Use `SELECT ... FOR UPDATE` during task assignment to ensure no user is assigned tasks beyond their capacity during simultaneous requests.

## 4. Frontend State Management
- **React Query**: Handles all server-state synchronization, caching, and background fetching.
- **Zustand**: Manages minimal global client-state (e.g., current simulated user).
- **Glassmorphism UI**: Uses a custom CSS-in-JS and Tailwind hybrid for a modern, professional dark theme.

## 5. Security & Performance
- **Headers**: Implements `Cache-Control: no-store` on critical data endpoints to prevent stale 304 responses.
- **Standard DTOs**: All API responses follow a strict `{ status, data, meta }` structure for consistency.
- **Atomic Transactions**: All multi-step updates (e.g., assigning a task and marking a bid as won) are wrapped in Knex transactions.
