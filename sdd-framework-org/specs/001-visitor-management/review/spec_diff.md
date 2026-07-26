# Specification Changes Diff

```diff
- The Visitor Management System (VMS) is a lightweight, web-based application designed to digitize the reception desk experience. It aims to eliminate manual entry logs, ensure real-time communication between reception and staff, and provide robust audit trails for security and compliance.
+ The Visitor Management System (VMS) is a web-based application designed to digitize the reception desk experience. It prioritizes stability and security by employing asynchronous processing for side-effects and rigorous data isolation to ensure compliance with PII lifecycle mandates.
- *   **Efficiency:** Automate the visitor check-in/out lifecycle.
+ *   **Efficiency:** Automate the visitor check-in/out lifecycle via optimized REST API endpoints.
- *   **Connectivity:** Enable instant, automated notifications for employees.
+ *   **Performance:** Prevent thread exhaustion and OOM errors by offloading binary storage and notifications.
- *   **Compliance:** Maintain a searchable, exportable audit trail of all site visitors.
+ *   **Security & Compliance:** Enforce immutable audit trails, BOLA protection, and automated PII sanitization.
- *   **Employee:** Recipient of visitor arrivals.
+ *   **Employee:** Recipient of visitor arrivals via background notification service.
- *   **Administrator:** System manager responsible for staff registry and system configuration.
+ *   **Administrator:** System manager for staff lifecycle, reporting, and configuration.
- 1.  **Check-In Flow:** Receptionist inputs visitor details → System assigns ID → Receptionist selects "Check-In" → System captures time & triggers notification → Employee receives notification.
+ 1.  **Check-In Flow:** Receptionist fetches pre-signed URL → Frontend uploads photo to storage → Receptionist submits details → System validates `BR-01` → System creates `Visit` record → System queues notification → Returns status.
- 2.  **Check-Out Flow:** Receptionist identifies visitor → Selects "Check-Out" → System calculates duration → Record finalized in database.
+ 2.  **Check-Out Flow:** Receptionist triggers check-out → System calculates duration → Updates status → Triggers PII expiration logic.
- | ID | Feature | Inputs | Logic/Rules | Output |
+ | ID | Feature | Logic/Rules | Processing Type |
- | :--- | :--- | :--- | :--- | :--- |
+ | :--- | :--- | :--- | :--- |
- | FR-01 | Registration | Visitor details | BR-01 (Unique mobile) | Visitor ID |
+ | FR-01 | Registration | Unique mobile check (Partial Index) | Synchronous |
- | FR-02 | Check-In | Visitor ID, Photo(opt) | BR-02 (Must be checked-in) | Notification to Employee |
+ | FR-02 | Check-In | State machine validation (BR-02) | Synchronous |
- | FR-03 | Check-Out | Visitor ID | Auto-calc duration | Audit record update |
+ | FR-03 | Notification | Background worker (BullMQ) | Asynchronous |
- | FR-04 | Reporting | Date range, Category | CSV Export | Filtered dataset |
+ | FR-04 | Binary Upload | Direct-to-storage via pre-signed URL | Asynchronous |
+ | FR-05 | Reporting | Streaming CSV generation | Streamed |
- *   **Headers:** `Authorization: Bearer <JWT>`
+ *   **Security:** JWT (Access Token) + Service-layer Authorization Interceptor.
-     { "visitorId": "V-1001", "photoUrl": "s3://path/to/img" }
+     { "visitorId": "V-1001", "photoKey": "uploads/123.jpg" }
-     { "status": "success", "checkInTime": "2023-10-27T10:00:00Z" }
+     { "status": "202 Accepted", "visitId": "TRANS-882", "message": "Check-in processing" }
- **Table: `Visitors`**
+ **Table: `Visitors` (Master Data)**
- *   `mobile_number`: VARCHAR(15) (Unique, Index)
+ *   `mobile_number`: VARCHAR(15) (Unique)
+ *   `pii_data`: JSONB (Encrypted)
+ 
+ **Table: `Visits` (Transactional)**
+ *   `id`: UUID (PK)
+ *   `visitor_id`: FK
- *   `expected_duration_hours`: INT (Constraint: <= 8)
+ *   `expires_at`: TIMESTAMP (Set to Check-out + 48h for PII sanitization)
+ *   *Index:* `CREATE UNIQUE INDEX idx_unique_active_visit ON visits (mobile_number) WHERE status IN ('registered', 'checked-in');`
- **Table: `Employees`**
+ **Table: `AuditLogs` (Append-Only)**
- *   `id`: UUID (PK)
+ *   `id`: SERIAL, `action`: TEXT, `actor_id`: UUID, `timestamp`: TIMESTAMP
- *   `email`: VARCHAR(255) (Unique)
+ *   *Constraint:* Trigger forbid UPDATE/DELETE.
- *   `is_active`: BOOLEAN (Default: TRUE)
- *   **Role-Based Access Control (RBAC):**
+ *   **Authentication & Access:**
-     *   Receptionist: CRUD on Visitors; Read on Employees.
+     *   **Dual-Token:** Short-lived access tokens + Secure `HttpOnly`, `Secure`, `SameSite=Strict` refresh token cookies.
-     *   Administrator: Full CRUD on Employees; Read/Export on Reports.
+     *   **BOLA Protection:** Service-layer interceptor validates `department_id` or `user_id` context for all data access.
-     *   Employee: Restricted Read to visitors assigned to them.
+ *   **PII Lifecycle:**
- *   **Security:**
+     *   **Sanitization:** Automated background job runs daily to clear `pii_data` for records where `expires_at` < `NOW()`.
-     *   **TLS 1.2+:** Mandatory for all transit.
+     *   **Soft-Delete:** Employees table utilizes `deleted_at` timestamp for audit retention.
-     *   **Data at Rest:** Sensitive PII (emails/mobiles) must be encrypted in PostgreSQL using `pgcrypto`.
+ *   **Performance & Stability:**
-     *   **Audit Logging:** Every state change (check-in/check-out) must be logged in `VisitHistory` with a system timestamp and user-actor ID.
+     *   **Binary Handling:** Direct upload to object storage via pre-signed URLs. Backend never processes file streams.
-     *   **Authentication:** JWT with a 1-hour expiration policy and secure HTTP-only cookie storage for frontend.
+     *   **Concurrency:** API utilizes `limit`/`offset` pagination and `fast-csv` stream generation for all report exports to prevent memory exhaustion.
+ *   **Auditability:** Every state change (Check-in/Check-out) is recorded in `AuditLogs` with the `actor_id` captured at the time of the event.
```