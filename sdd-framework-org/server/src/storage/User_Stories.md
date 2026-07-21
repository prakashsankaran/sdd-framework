# Agile User Stories Backlog

## US-SYS-01: Automated Meeting Ingestion
* **As a:** Standard Employee
* **I want to:** Have my calendar meetings automatically synced and processed by the platform
* **So that:** I can save time on manual entry and ensure all meeting context is captured

### Acceptance Criteria
- System successfully connects to Outlook/Google Calendar via OAuth
- System creates a Meeting record upon sync
- System triggers transcription workflow once the meeting starts

* **Priority:** High
* **Story Points:** 5
* **Technical Notes:** Requires integration with O365/Google Workspace APIs. Need a web hook listener for calendar updates.

---

## US-SYS-02: AI-Powered Action Extraction
* **As a:** Project Manager
* **I want to:** Have the system automatically extract action items from meeting transcripts
* **So that:** I can focus on managing the project rather than documenting meeting minutes

### Acceptance Criteria
- System correctly identifies owner, due date, and task description
- System maps extracted data to the defined JSON schema
- System assigns status 'OPEN' by default upon creation

* **Priority:** High
* **Story Points:** 8
* **Technical Notes:** Use NER and Intent Classification via LLM. Post-process to map speakers to known user IDs.

---

## US-SYS-03: Action Item Status Updates
* **As a:** Standard Employee
* **I want to:** Update the status of my assigned action items
* **So that:** My project manager has visibility into my progress

### Acceptance Criteria
- Ability to transition status between OPEN, IN_PROGRESS, BLOCKED, and COMPLETED
- Changes are logged in the system audit trail
- Status changes are reflected in real-time dashboards

* **Priority:** Medium
* **Story Points:** 3
* **Technical Notes:** Expose PUT /api/v1/actions/{id} endpoint with status validation against the defined ENUM.

---

## US-SYS-04: Strategic Risk Detection
* **As a:** Executive
* **I want to:** Monitor meeting transcripts for high-level risks
* **So that:** I can intervene early in projects that show signs of blockers or negative sentiment

### Acceptance Criteria
- System flags transcript segments as High, Medium, or Low risk
- Executive dashboard displays aggregated risk levels across projects
- System alerts when a 'Critical' risk is detected

* **Priority:** Medium
* **Story Points:** 5
* **Technical Notes:** Implement pattern matching and sentiment analysis on processed transcripts stored in the database.

---

## US-SYS-05: Semantic Knowledge Retrieval
* **As a:** Project Manager
* **I want to:** Query past meetings and decisions using natural language
* **So that:** I can retrieve context from months of meetings without manually reading through transcripts

### Acceptance Criteria
- System accepts natural language search queries
- Search results return relevant meeting segments
- Vector search engine performs matching against stored embeddings

* **Priority:** Medium
* **Story Points:** 8
* **Technical Notes:** Leverage Qdrant for vector storage. Generate embeddings using 1536-dimensional model.

---

## US-SYS-06: Role-Based Access Control Implementation
* **As a:** Administrator
* **I want to:** Define strict access policies based on user roles and meeting participation
* **So that:** Sensitive organizational data remains private and secure

### Acceptance Criteria
- Users can only access meetings they participated in
- PMs access is restricted to their project scope
- Admin role provides global read/write access
- MFA is required for all Manager/Admin login attempts

* **Priority:** High
* **Story Points:** 5
* **Technical Notes:** Enforce RBAC at the API middleware level. Use JWT claims to verify permissions on every request.

---

## US-SYS-07: Secure Audit Logging
* **As a:** Administrator
* **I want to:** Review a detailed log of all administrative actions and AI queries
* **So that:** I can maintain compliance and investigate potential security incidents

### Acceptance Criteria
- Every data export and system change is recorded
- Audit logs include timestamp, User ID, and IP address
- Logs are immutable and stored in the AuditLog table

* **Priority:** Low
* **Story Points:** 3
* **Technical Notes:** Implement a database trigger or middleware to capture request context for the AuditLog table.

---

