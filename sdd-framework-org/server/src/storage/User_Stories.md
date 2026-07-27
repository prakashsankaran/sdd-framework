# Agile User Stories Backlog

## US-VMS-01: Visitor Registration and Check-In
* **As a:** Receptionist
* **I want to:** register a visitor and upload their photo via a secure S3 process
* **So that:** we maintain an accurate digital log of all arrivals while ensuring photo storage compliance

### Acceptance Criteria
- System validates mobile number against existing active visits to prevent duplicates
- System generates a presigned S3 URL for secure photo upload
- Record is created with 'Checked-In' status upon successful upload
- Triggers async notification to the designated employee

* **Priority:** High
* **Story Points:** 8
* **Technical Notes:** Requires integration with S3 presigned URL API; implement RLS and DB trigger trg_verify_employee_active.

---

## US-VMS-02: Visitor Check-Out
* **As a:** Receptionist
* **I want to:** mark a visitor as checked-out
* **So that:** the visit history is finalized and the record can be archived for compliance

### Acceptance Criteria
- System records the precise end time
- Ensures check_out time is chronologically after check_in time
- Record is moved to archived state

* **Priority:** High
* **Story Points:** 3
* **Technical Notes:** Enforce CHECK (check_out > check_in) constraint at the database level.

---

## US-VMS-03: Employee Visitor Portal
* **As a:** Employee
* **I want to:** view my specific incoming visitor logs
* **So that:** I can stay informed about my appointments while maintaining data privacy

### Acceptance Criteria
- Must support JWT-based authentication
- PII must be appropriately masked based on system configuration
- Results are restricted to the logged-in user's own data only

* **Priority:** Medium
* **Story Points:** 5
* **Technical Notes:** Use PostgreSQL RLS with SET LOCAL app.current_user_id to ensure BOLA mitigation.

---

## US-VMS-04: Administrator User Management
* **As a:** Administrator
* **I want to:** manage employee active status and visitor types
* **So that:** the system reflects current organizational staff and registration categories

### Acceptance Criteria
- Admin can toggle is_active status for employees
- Admin can update the Visitor Type dropdown labels
- Changes are reflected immediately in registration flows

* **Priority:** High
* **Story Points:** 5
* **Technical Notes:** Restricted to Admin role via controller-level validation.

---

## US-VMS-05: Visitor Data Reporting
* **As a:** Administrator
* **I want to:** export visitor logs as a CSV file
* **So that:** I can perform compliance auditing and department-specific reporting

### Acceptance Criteria
- Support filtering by date range, visitor type, and employee
- Download triggers a CSV file export
- Requires secure authentication and authorization

* **Priority:** Medium
* **Story Points:** 5
* **Technical Notes:** Implement GET /api/reports/export with Content-Disposition headers.

---

## US-VMS-06: Data Privacy Lifecycle Maintenance
* **As a:** System
* **I want to:** automatically anonymize PII and purge old media
* **So that:** the application remains compliant with data retention and privacy policies

### Acceptance Criteria
- S3 files are purged after 14 days
- PII for records older than 30 days is anonymized via background worker
- Process runs nightly without interrupting system performance

* **Priority:** High
* **Story Points:** 8
* **Technical Notes:** Requires a cron-based background job. S3 lifecycle policies should be utilized for media.

---

