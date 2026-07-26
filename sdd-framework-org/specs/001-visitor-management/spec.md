# spec.md

## 1. Executive Summary & Goals
The Visitor Management System (VMS) is a lightweight, web-based application designed to digitize the reception desk experience. It aims to eliminate manual entry logs, ensure real-time communication between reception and staff, and provide robust audit trails for security and compliance.

**Key Goals:**
*   **Efficiency:** Automate the visitor check-in/out lifecycle.
*   **Connectivity:** Enable instant, automated notifications for employees.
*   **Compliance:** Maintain a searchable, exportable audit trail of all site visitors.

---

## 2. User Persona, Actors, and User Flows

### Actors
*   **Receptionist:** Primary operator of the registration and check-in workflows.
*   **Employee:** Recipient of visitor arrivals.
*   **Administrator:** System manager responsible for staff registry and system configuration.

### User Flows
1.  **Check-In Flow:** Receptionist inputs visitor details → System assigns ID → Receptionist selects "Check-In" → System captures time & triggers notification → Employee receives notification.
2.  **Check-Out Flow:** Receptionist identifies visitor → Selects "Check-Out" → System calculates duration → Record finalized in database.

---

## 3. Functional Requirements

| ID | Feature | Inputs | Logic/Rules | Output |
| :--- | :--- | :--- | :--- | :--- |
| FR-01 | Registration | Visitor details | BR-01 (Unique mobile) | Visitor ID |
| FR-02 | Check-In | Visitor ID, Photo(opt) | BR-02 (Must be checked-in) | Notification to Employee |
| FR-03 | Check-Out | Visitor ID | Auto-calc duration | Audit record update |
| FR-04 | Reporting | Date range, Category | CSV Export | Filtered dataset |

---

## 4. API Schema Contract (Sample)

**Endpoint: `POST /api/v1/visitors/check-in`**
*   **Headers:** `Authorization: Bearer <JWT>`
*   **Request:**
    ```json
    { "visitorId": "V-1001", "photoUrl": "s3://path/to/img" }
    ```
*   **Response:**
    ```json
    { "status": "success", "checkInTime": "2023-10-27T10:00:00Z" }
    ```

---

## 5. Data Model Constraints

**Table: `Visitors`**
*   `id`: UUID (PK)
*   `mobile_number`: VARCHAR(15) (Unique, Index)
*   `status`: ENUM('registered', 'checked-in', 'checked-out')
*   `expected_duration_hours`: INT (Constraint: <= 8)

**Table: `Employees`**
*   `id`: UUID (PK)
*   `email`: VARCHAR(255) (Unique)
*   `is_active`: BOOLEAN (Default: TRUE)

---

## 6. Compliance & Security Mandates

*   **Role-Based Access Control (RBAC):**
    *   Receptionist: CRUD on Visitors; Read on Employees.
    *   Administrator: Full CRUD on Employees; Read/Export on Reports.
    *   Employee: Restricted Read to visitors assigned to them.
*   **Security:**
    *   **TLS 1.2+:** Mandatory for all transit.
    *   **Data at Rest:** Sensitive PII (emails/mobiles) must be encrypted in PostgreSQL using `pgcrypto`.
    *   **Audit Logging:** Every state change (check-in/check-out) must be logged in `VisitHistory` with a system timestamp and user-actor ID.
    *   **Authentication:** JWT with a 1-hour expiration policy and secure HTTP-only cookie storage for frontend.