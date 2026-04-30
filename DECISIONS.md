# Project Decisions

### Why enforce constraints at the database level?

We chose to enforce all core business rules—like preventing self-bidding or ensuring tasks only move forward—directly in the database using PostgreSQL triggers and unique constraints. 

The main reason is **reliability**. While we check these rules in our TypeScript code for fast UI feedback, the database is the "single source of truth." By putting the rules there, we guarantee that no matter what happens in the application (bugs, race conditions, or manual API calls), the data remains 100% valid. It’s a final line of defense that keeps the system's integrity intact even under high concurrency.

### What are the trade-offs?

Every design choice has a cost. By moving logic into the database, we face a few trade-offs:

1.  **More Complex Error Handling**: The backend has to catch specific database errors and "translate" them into friendly messages for the user. It’s more work than just checking a simple `if` statement in the code.
2.  **Hidden Logic**: For a new developer, it’s not immediately obvious that these rules exist just by looking at the TypeScript files; they have to check the SQL migration files too.
3.  **Testing**: We can't just rely on quick unit tests. We have to run full integration tests with a live database to make sure these triggers are actually firing and working as expected.

### How do we handle simultaneous assignments for the same user?

A critical challenge is when two different tasks try to assign themselves to the same user at the exact same time. If the user only has capacity for one task, we must ensure they aren't accidentally over-allocated.

Our approach uses **Atomic Transactions and Row-Level Locking**:

1.  **Locking the User**: When the `/assign` endpoint is called, we don't just "read" the user's capacity. We use a `SELECT ... FOR UPDATE` query. This tells the database to "lock" that specific user's row until the assignment is finished.
2.  **Sequential Processing**: If a second task tries to assign itself to the same user while the first lock is held, the database makes it wait. 
3.  **Fresh Data**: Once the first task is assigned and the workload is updated, the lock is released. Only then does the second task get to see the user's data. Because it now sees the *updated* (higher) workload, it will correctly realize the user is out of capacity and reject the second assignment.

### Scenario: The Capacity Race Condition

**Question:** *User A has 10 hours left. Task X (5h) and Task Y (7h) both try to assign themselves to User A at the same time. How does the system handle this?*

**Answer:**
Even if both requests hit the server at the exact same millisecond:
- **Request 1 (Task X)** locks User A's row. It sees 10h available, subtracts 5h, updates User A to have 5h left, and commits the transaction.
- **Request 2 (Task Y)** is forced to wait until Request 1 is finished.
- As soon as Request 1 commits, Request 2 wakes up, gets the lock, and reads the **new** value (5h).
- Since 7h is more than the 5h now available, Request 2 will reject User A and move to the next lowest bidder. 

This ensures that no user can ever be assigned more work than they have room for, even under heavy simultaneous load.
