# tasks.md

## 1. Project Setup
- [ ] Initialize Environment: Setup Git repository, Node.js project, and React/Tailwind workspace.
- [ ] Dependency Installation: Install Express, PG (PostgreSQL client), JWT, and frontend packages.
- [ ] Environment Configuration: Setup `.env` files for Database URLs, JWT secrets, and port configurations.

## 2. Backend Database
- [ ] Schema Design: Create SQL migration scripts for `Users`, `Employees`, `Visitors`, `VisitorTypes`, and `VisitHistory`.
- [ ] Database Connection: Implement connection pooling and utility for database interactions.
- [ ] Data Seeding: Create initial seed data for `VisitorTypes` and an admin user.

## 3. Backend APIs
- [ ] Authentication Module: Implement JWT login and secure route protection middleware.
- [ ] Employee Management API: CRUD endpoints for managing employee records (Admin access only).
- [ ] Visitor Registration API: Endpoints for visitor intake with validation (e.g., BR-01).
- [ ] Check-In/Check-Out API: Logic to handle state transitions, timestamp logging, and duration calculations.
- [ ] Search & Reporting API: Implementation of query filters for visitors and data aggregation for CSV exports.

## 4. Frontend Components
- [ ] Layout & UI Library: Setup Tailwind CSS theme, navigation sidebar, and shared layout.
- [ ] Authentication Components: Login form with JWT token storage in `localStorage`/`httpOnly` cookie.
- [ ] Data Input Forms: Reusable components for visitor registration and employee management.
- [ ] Data Display: Reusable tables for visitor lists and dashboard metric cards.

## 5. Frontend Pages
- [ ] Login Page: Secure access portal.
- [ ] Receptionist Dashboard: View today’s visitors, quick-action buttons for check-in/out.
- [ ] Visitor Registration Page: Form with validation constraints (e.g., BR-04).
- [ ] Employee Management Page: Admin interface to add/edit/disable employees.
- [ ] Reports Page: Filters for date/employee/type and CSV export trigger.

## 6. Integration & QA
- [ ] Notification Logic: Implement mock email service triggered upon successful check-in (BR-05).
- [ ] State Verification: Validate BR-02 (Check-out logic) and BR-03 (Active employee check).
- [ ] Performance Testing: Verify < 2s page response time.
- [ ] Integration Testing: End-to-end testing of the full visitor lifecycle: Register -> Check-in -> Notify -> Check-out.
- [ ] Deployment Readiness: Finalize build configuration and clean up audit logs.