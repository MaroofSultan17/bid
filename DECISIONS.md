# Architecture Decisions - TaskBid

This document outlines the key technical decisions made during the development of TaskBid, addressing the specific challenges posed in the assignment.

## A. The Capacity Race Condition
**Decision: Row-Level Locking (`FOR UPDATE`) within a Database Transaction.**

To prevent two simultaneous `/assign` calls from double-allocating a user's capacity, we use a single atomic transaction. 
1. We first lock the task row.
2. For each potential bidder, we obtain a row-level lock on the `users` table row using `SELECT ... FOR UPDATE`.
3. Because locks are obtained in the same order (lowest bid first), we avoid deadlocks. 
4. While the first transaction holds the lock, any second transaction attempting to lock the same user row will block until the first one commits or rolls back. 
5. This ensures that the second transaction sees the updated `current_workload_hours` and correctly rejects the bid if the user is now over capacity.

## B. The Stale Bid Problem
**Decision: Late Validation and Bid Invalidation.**

Bids are validated for capacity at two points:
1. **Creation time:** We prevent placing a bid that exceeds *current* remaining capacity.
2. **Assignment time:** We re-validate capacity because it may have changed.

If a bidder no longer has capacity at assignment time, their bid is marked as `invalid` and we skip to the next lowest bidder. We chose to keep the bid record with an `invalid` status rather than deleting it to maintain a complete audit trail of the auction process.

## C. The Dashboard Query Challenge
**Decision: Single CTE (Common Table Expression) for Aggregated Metrics.**

To optimize performance and minimize round-trips to the database, the dashboard metrics are fetched in a single query using multiple CTEs. 
- `tasks_by_status`: Counts tasks grouped by status.
- `avg_bid_complexity`: Calculates average hours offered per complexity level.
- `top_users`: Identifies top contributors.
- `expired_no_bids`: Finds tasks past deadline with zero bids.

These are joined together into a single JSON response. This approach leverages PostgreSQL's powerful aggregation capabilities and reduces application-level overhead.

## D. The Audit Log Design
**Decision: Database-Level Triggers.**

Audit logging for state changes (tasks and bids) is implemented using PostgreSQL triggers.
- **Pros:** 100% guarantee that every change is captured, even if made outside the application (e.g., via psql). It keeps the application logic cleaner by separating cross-cutting concerns.
- **Cons:** Business logic becomes "hidden" in the database, making it slightly harder to debug for developers who only look at the application code.

We chose triggers because the requirement for an audit log is a core data integrity constraint in a collaborative system.

## E. Real-Time Updates
**Decision: Server-Sent Events (SSE).**

We chose SSE over WebSockets for real-time bid updates and dashboard refreshes.
- **Justification:** SSE is significantly simpler to implement (standard HTTP), automatically handles reconnection, and is perfectly suited for our unidirectional "server-to-client" update pattern. Since we don't need low-latency bidirectional communication for this specific use case, SSE provides the best trade-off between complexity and reliability.

## F. Database-Level Constraints
We enforced "no self-bidding" and "status forward-only" at the database level using triggers.
- **Rationale:** Application-level checks are prone to bugs and bypasses. Database constraints provide the final line of defense for business invariants, ensuring the data remains consistent regardless of application state.
- **Trade-off:** Higher development friction when testing (must handle DB exceptions) and slightly more complex migration files.
