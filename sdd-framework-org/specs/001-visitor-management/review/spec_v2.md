# spec.md

## 1. Executive Summary & Goals
The Visitor Management System (VMS) is a web-based application designed to digitize the reception desk experience. It prioritizes stability and security by employing asynchronous processing for side-effects and rigorous data isolation to ensure compliance with PII lifecycle mandates.

**Key Goals:**
*   **Efficiency:** Automate the visitor check-in/out lifecycle via optimized REST API endpoints.
*   **Performance:** Prevent thread exhaustion and OOM errors by offloading binary storage and notifications.
*   **Security & Compliance:** Enforce immutable audit trails, BOLA protection, and automated PII sanitization.

---

## 2. User Persona, Actors, and User Flows

### Actors
*   **Receptionist:** Primary operator of the registration and check-in workflows.
*   **Employee:** Recipient of visitor arrivals via background notification service.
*   **Administrator:** System manager for staff lifecycle, reporting, and configuration.

### User Flows
1.  **Check-In Flow:** Receptionist fetches pre-signed URL → Frontend uploads photo to storage → Receptionist submits details → System validates `BR-01` → System creates `Visit` record → System queues notification → Returns status.
2.  **Check-Out Flow:** Receptionist triggers check-out → System calculates duration → Updates status → Triggers PII expiration logic.

---

## 3. Functional Requirements

| ID | Feature | Logic/Rules | Processing Type |
| :--- | :--- | :--- | :--- |
| FR-01 | Registration | Unique mobile check (Partial Index) | Synchronous |
| FR-02 | Check-In | State machine validation (BR-02) | Synchronous |
| FR-03 | Notification | Background worker (BullMQ) | Asynchronous |
| FR-04 | Binary Upload | Direct-to-storage via pre-signed URL | Asynchronous |
| FR-05 | Reporting | Streaming CSV generation | Streamed |

---

## 4. API Schema Contract (Sample)

**Endpoint: `POST /api/v1/visitors/check-in`**
*   **Security:** JWT (Access Token) + Service-layer Authorization Interceptor.
*   **Request:**
    ```json
    { "visitorId": "V-1001", "photoKey": "uploads/123.jpg" }
    ```
*   **Response:**
    ```json
    { "status": "202 Accepted", "visitId": "TRANS-882", "message": "Check-in processing" }
    ```

---

## 5. Data Model Constraints

**Table: `Visitors` (Master Data)**
*   `id`: UUID (PK)
*   `mobile_number`: VARCHAR(15) (Unique)
*   `pii_data`: JSONB (Encrypted)

**Table: `Visits` (Transactional)**
*   `id`: UUID (PK)
*   `visitor_id`: FK
*   `status`: ENUM('registered', 'checked-in', 'checked-out')
*   `expires_at`: TIMESTAMP (Set to Check-out + 48h for PII sanitization)
*   *Index:* `CREATE UNIQUE INDEX idx_unique_active_visit ON visits (mobile_number) WHERE status IN ('registered', 'checked-in');`

**Table: `AuditLogs` (Append-Only)**
*   `id`: SERIAL, `action`: TEXT, `actor_id`: UUID, `timestamp`: TIMESTAMP
*   *Constraint:* Trigger forbid UPDATE/DELETE.

---

## 6. Compliance & Security Mandates

*   **Authentication & Access:**
    *   **Dual-Token:** Short-lived access tokens + Secure `HttpOnly`, `Secure`, `SameSite=Strict` refresh token cookies.
    *   **BOLA Protection:** Service-layer interceptor validates `department_id` or `user_id` context for all data access.
*   **PII Lifecycle:**
    *   **Sanitization:** Automated background job runs daily to clear `pii_data` for records where `expires_at` < `NOW()`.
    *   **Soft-Delete:** Employees table utilizes `deleted_at` timestamp for audit retention.
*   **Performance & Stability:**
    *   **Binary Handling:** Direct upload to object storage via pre-signed URLs. Backend never processes file streams.
    *   **Concurrency:** API utilizes `limit`/`offset` pagination and `fast-csv` stream generation for all report exports to prevent memory exhaustion.
*   **Auditability:** Every state change (Check-in/Check-out) is recorded in `AuditLogs` with the `actor_id` captured at the time of the event.