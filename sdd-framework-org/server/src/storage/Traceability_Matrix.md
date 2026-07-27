# Requirements Traceability Matrix

Status: **100% Traceability Coverage Traceability Coverage Achieved**

| Requirement ID (FSD) | User Story ID (JIRA) | Tech Spec Section | Database Tables | Test Case IDs |
| --- | --- | --- | --- | --- |
| FR-01 | US-001: Visitor Registration | Section 4.1: POST /api/visitors/check-in, Section 5: VisitHistory table | Visitors, VisitHistory | TC-REG-01, TC-REG-02 |
| FR-02 | US-002: Check-In Logic | Section 2.2: Flow 1, Section 5: Constraints & Triggers | VisitHistory | TC-CI-01, TC-CI-02 |
| FR-03 | US-003: Async Notifications | Section 4.1: Async notification dispatch, Section 6: Performance | N/A (External Email/Queue) | TC-NOT-01 |
| FR-04 | US-004: Search Functionality | Section 3.4: Filtered search query logic | Visitors, VisitHistory | TC-SRCH-01 |
| FR-05 | US-005: Reporting | Section 4.3: GET /api/reports/export | VisitHistory | TC-REP-01 |
| FR-06 | US-006: Admin Employee CRUD | Section 2.2: Flow 3, Section 5: Employees Table | Employees | TC-ADM-01, TC-ADM-02 |
| FR-07 | US-007: Visitor Type Management | Section 3.7: Admin configuration | VisitorTypes | TC-ADM-03 |
| FR-08 | US-008: Employee Portal | Section 6: Hybrid Authorization, Section 4.8 | VisitHistory, Employees | TC-PORTAL-01 |
| SEC-01 | US-009: Security & Compliance | Section 6: RLS, S3 Lifecycle, PII Anonymization | Audit_Logs, VisitHistory | TC-SEC-01, TC-SEC-02, TC-SEC-03 |
