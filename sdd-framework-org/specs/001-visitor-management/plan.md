# plan.md

## 1. Summary of Architecture
The system follows a decoupled Client-Server architecture:
*   **Frontend:** React SPA with Tailwind CSS for a responsive, mobile-first design.
*   **Backend:** Node.js/Express RESTful API.
*   **Database:** PostgreSQL for relational data integrity (Visitors, Employees, Logs).
*   **Auth:** JWT-based stateless authentication.
*   **Data Flow:** Client requests via REST API -> Auth Middleware -> Controller -> Service -> Repository (SQL).

---

## 2. Components and Directory Structure

### Directory Structure
```text
/vms-system
├── /client (React)
│   ├── /src/components (Auth, Dashboard, VisitorForm, Navbar)
│   ├── /src/services (API calls using Axios)
│   └── /src/pages (Login, Register, CheckIn, Reports)
├── /server (Node.js/Express)
│   ├── /controllers (VisitorController, AuthController, EmployeeController)
│   ├── /models (Sequelize/Prisma definitions for User, Employee, Visitor, VisitHistory)
│   ├── /middleware (Auth, Validation)
│   ├── /routes (Express routes)
│   └── /utils (Email mock, Logger)
└── /database
    └── schema.sql
```

### Key Components to Create
*   **Auth Module:** Middleware for JWT verification and RBAC (Role-Based Access Control).
*   **Visitor Service:** Logic for BR-01 (Unique mobile), BR-02 (Sequence), and BR-04 (Duration).
*   **Notification Service:** Mock email service to trigger on successful Check-In.

---

## 3. Phased Implementation Schedule

### Phase 1: Core Setup (Days 1-3)
*   Initialize Git repository.
*   Setup PostgreSQL schema and connection.
*   Implement JWT Auth (Login/Session handling).
*   CRUD for Employees (Admin role).

### Phase 2: Visitor Operations (Days 4-7)
*   Implement Visitor Registration & Search endpoints.
*   Implement Check-In/Check-Out logic with State validation (BR-01, BR-02).
*   Build Frontend: Visitor form and Receptionist dashboard.

### Phase 3: Notifications & Dashboard (Days 8-10)
*   Implement mock email service for "Notify Employee".
*   Build Dashboard analytics (Today's counts).
*   Implement Report generation (CSV export).

### Phase 4: Security & Polish (Days 11-12)
*   Add Audit Logging (track system actions).
*   UI/UX cleanup using Tailwind CSS.
*   Performance optimizations for < 2s response time.

---

## 4. Verification Plan

### Automated Testing
*   **Unit Tests:** Jest for service layer logic (checking BR-01, BR-04).
*   **Integration Tests:** Supertest for API routes (testing Check-In flow sequence).

### Manual Test Flows
1.  **Registration Flow:** Admin logs in -> Creates an Employee -> Receptionist logs in -> Registers visitor -> Verifies Visitor ID generation.
2.  **Operational Flow:** Receptionist marks "Check-In" -> Verify "Employee notified" mock status -> Verify DB status updates to "Checked-In".
3.  **Constraint Validation:** 
    *   Attempt Check-Out before Check-In (Assert Error).
    *   Attempt duplicate mobile number for active visit (Assert Error).
4.  **Reporting:** Admin generates report by date -> Verify CSV export contains expected headers and data.

### Test API Routes (Postman/Curl)
*   `POST /api/auth/login`
*   `POST /api/visitors/checkin`
*   `POST /api/visitors/checkout/:id`
*   `GET /api/reports/export?format=csv`