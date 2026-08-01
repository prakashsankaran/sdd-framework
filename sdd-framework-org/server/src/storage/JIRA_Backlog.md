# JIRA Backlog Export

| Summary | Description | Issue Type | Priority | Story Points | Labels |
| --- | --- | --- | --- | --- | --- |
| JIRA-001: Implement PostgreSQL RLS and Auth Context | Configure PostgreSQL Row-Level Security policies on the VisitHistory and Employees tables. Ensure the application middleware correctly sets 'app.current_user_id' per session to enforce data isolation and mitigate BOLA vulnerabilities. | Task | High | 8 | Backend, Security, Database |
| JIRA-002: User Story - Visitor Registration & Check-in | As a Receptionist, I want to register visitors and capture photos via presigned S3 URLs so that we have a secure, digital record of every visitor. Includes validation against 'idx_unique_active_visitor_mobile'. | Story | High | 5 | Frontend, Backend, Feature |
| JIRA-003: Implement Double-Token Authentication | Develop auth middleware utilizing the Double-Token pattern: 15-minute JWT Access Tokens and HttpOnly, Secure, SameSite=Strict Refresh Token cookies to ensure secure session management. | Task | High | 5 | Security, Auth |
| JIRA-004: Develop Nightly PII Anonymization Worker | Create a background task to identify records older than 30 days and redact/anonymize PII fields in the database to comply with data privacy mandates. | Task | Medium | 3 | Backend, Compliance |
| JIRA-005: User Story - Employee Portal History View | As an Employee, I want to view logs of my past visitors through my portal so I can maintain awareness of my departmental activity. Data must be filtered by my specific user_id context. | Story | Medium | 3 | Frontend, UserPortal |
| JIRA-006: Admin CRUD for Employees and Visitor Types | Create secure admin endpoints to manage employee 'is_active' status and configure global visitor type dropdown labels. | Story | Medium | 3 | Admin, Backend |
| JIRA-007: Setup Async Notification Microtask Queue | Implement a non-blocking notification dispatch system that triggers upon successful visitor check-in to ensure API response times remain under 2 seconds. | Task | Medium | 5 | Backend, Performance |
| JIRA-008: Bug - Missing S3 Lifecycle Configuration | S3 bucket files are currently retained indefinitely. Configure S3 Lifecycle policies to automatically purge media files after 14 days per compliance mandate. | Bug | High | 2 | Infrastructure, Compliance |
