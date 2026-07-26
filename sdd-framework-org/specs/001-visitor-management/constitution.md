# constitution.md

## 1. Core Principles
*   **User-First Design:** The interface must prioritize the receptionist's workflow, ensuring minimal clicks to register and check-in visitors.
*   **Secure-by-Default:** All API endpoints must be protected by JWT-based authentication. PII (Personally Identifiable Information) must be handled with care and never exposed in public logs.
*   **Auditability:** Every state change (Check-in/Check-out) must be immutable and traceable.
*   **Simplicity & Maintainability:** Avoid over-engineering; adhere to the "lightweight" requirement. Solutions should prioritize readability over complex abstraction.
*   **Performance:** All page loads and API requests must adhere to the <2s response requirement.

## 2. Technology Stack Guidelines
*   **Database (PostgreSQL):** Must be used as the single source of truth. Schema design should emphasize strong relational integrity (Foreign Keys between `Visitors`, `Employees`, and `VisitHistory`).
*   **Backend (Node.js/Express):** 
    *   RESTful architectural pattern. 
    *   Decoupled architecture: Keep business logic (services) separate from request handling (controllers).
    *   Notifications should be handled via a non-blocking approach to ensure API response times are not degraded.
*   **Frontend (React/Vite/Tailwind):**
    *   State management should favor React Query (TanStack Query) for server-state synchronization.
    *   Tailwind CSS is mandatory for styling to maintain a consistent, mobile-friendly design system.
    *   Vite must be used as the build tool for faster development cycles.

## 3. Architectural Boundaries & Rules
*   **API Integrity:** All client requests must be validated against a schema (e.g., Joi or Zod) before reaching the controller.
*   **Business Logic Encapsulation:** Business Rules (BR-01 to BR-05) must be enforced at the API service layer, not purely in the frontend.
*   **State Machine:** The `Visit` lifecycle (Registered -> Checked-In -> Checked-Out) must be treated as a state machine. Transitions must validate against `BR-02`.
*   **Modularization:** Code must be organized by domain (Visitor, Employee, Reports, Dashboard). No logic should exist in the `routes/` files.
*   **Environment Parity:** The application must strictly use environment variables for configuration (DB credentials, JWT secrets, Email mock settings).
*   **Out-of-Scope Enforcement:** To maintain project velocity, features marked "Out of Scope" (e.g., QR codes, Face Recognition) must not be implemented. If requested, they must be moved strictly to the "Future Enhancements" documentation.

## 4. Operational Standards
*   **Documentation:** All API endpoints must be documented (OpenAPI/Swagger) to ensure the Frontend team can work in parallel.
*   **Error Handling:** A global error handler must be implemented to ensure the API consistently returns meaningful status codes (400, 401, 403, 404, 500) and JSON payloads.
*   **Deployment:** The system must be designed for single-office deployment as defined in the project scope. Multi-tenancy logic should not be introduced.