# research.md

## 1. Summary of Stack Constraints
The project mandates a specific technology stack: **React (Frontend)**, **Node.js/Express (Backend)**, **PostgreSQL (Database)**, and **JWT (Authentication)**.

*   **Constraint Implication:** The selection of a relational database (PostgreSQL) is ideal for the highly structured nature of visitor logs and audit trails. However, the requirement for "100 concurrent users" in a Node.js/Express environment necessitates careful management of the event loop to ensure non-blocking I/O, especially when handling file uploads (visitor photos) and report generation.
*   **State Management:** With React, local component state is sufficient for basic forms, but `React Query` (TanStack Query) is highly recommended for server-side state synchronization, specifically for dashboard auto-refreshing and caching visitor lists.

## 2. Evaluation of Integration Challenges
The current requirements present several edge cases and potential failure states that require robust error handling:

*   **Concurrency & Data Integrity:**
    *   *Gotcha:* BR-01 (Mobile number unique for active visits). A race condition could occur if two receptionists register the same mobile number simultaneously.
    *   *Resolution:* Implement a database-level unique constraint on `(mobile_number, status='checked-in')` or utilize a transaction block with `SELECT FOR UPDATE` to lock the visitor record during the registration process.
*   **Asynchronous Notifications:**
    *   *Gotcha:* Since email notifications are a mock implementation, a failure in the notification service should not block the Check-In process. 
    *   *Resolution:* Use a Message Queue (e.g., BullMQ with Redis) to handle notifications asynchronously. If the email service fails, the system should log the failure and allow the receptionist to manually trigger a re-send.
*   **Check-Out State:**
    *   *Gotcha:* BR-02 states visitors cannot check out before check-in. This implies a "Pending" vs "Active" state machine.
    *   *Resolution:* Implement a strict state transition model (Pending -> Checked-In -> Checked-Out) in the API layer. Requests attempting an invalid transition should return a `409 Conflict` HTTP status code.

## 3. Recommendations

### Scaling & Performance
*   **Database Indexing:** Ensure B-Tree indexes on `Visitor.mobile_number`, `Visitor.visitor_id`, and `VisitHistory.created_at`. This is critical for meeting the "Page response < 2 seconds" requirement as the `VisitHistory` table grows.
*   **Pagination:** The dashboard and search features must implement server-side pagination. Do not fetch the entire `VisitHistory` table to the frontend.
*   **Image Handling:** Do not store visitor photos directly in PostgreSQL as Bytea. Store photos in a secure File System or Object Storage (e.g., AWS S3 or a local `/uploads` volume) and store the URI path in the database.

### Caching
*   **Read-Heavy Operations:** Use `Redis` for caching the "Today's Visitors" dashboard data. Since this list changes frequently but is read often, a 30-second TTL (Time-to-Live) cache will significantly reduce database load during peak reception hours.

### Third-Party SDK/Tooling Choices
*   **Validation:** Use `Zod` for schema validation in both the frontend and backend to ensure request/response contract integrity.
*   **Logging:** Implement `Winston` or `Pino` for structured logging. Since "Audit logging" is a non-functional requirement, all state-changing actions (Check-in/Check-out) should be piped to a dedicated `audit_logs` table.
*   **Date Handling:** Use `date-fns` or `Day.js` to handle time-zone discrepancies and duration calculations (Check-out Time - Check-in Time), ensuring consistency across the dashboard and reports.
*   **Report Generation:** For CSV exports, use `json2csv` or `fast-csv`. For large data sets, implement a streaming response to ensure the server does not run out of memory.