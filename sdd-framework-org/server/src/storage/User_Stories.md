# Agile User Stories Backlog

## US-SYS-01: Automated Calendar Synchronization
* **As a:** Project Manager
* **I want to:** Integrate my Outlook or G-Suite calendar with the platform
* **So that:** Meeting data is automatically ingested without manual entry and linked to relevant projects

### Acceptance Criteria
- System successfully authenticates via OAuth2 with calendar provider
- System creates 'Meeting' entities for events in the calendar
- Events are periodically polled for updates (start time, participants)

* **Priority:** High
* **Story Points:** 5
* **Technical Notes:** Use Microsoft Graph API / Google Calendar API; implement webhooks for real-time sync updates.

---

## US-SYS-02: Audio Transcription and Diarization
* **As a:** Employee
* **I want to:** Have meeting audio files processed into text
* **So that:** I can reference accurate meeting transcripts instead of manual note-taking

### Acceptance Criteria
- Audio uploaded is processed by Whisper API
- Output includes timestamps and distinct speaker labels
- JSON output follows the schema defined in Section 3

* **Priority:** High
* **Story Points:** 8
* **Technical Notes:** Utilize Whisper API or equivalent; ensure audio is pre-processed to mono 16kHz for optimal diarization performance.

---

## US-SYS-03: AI-Driven Summarization and Action Extraction
* **As a:** Project Manager
* **I want to:** Automatically generate meeting summaries and extract action items
* **So that:** I can quickly identify outcomes and assign tasks without reviewing the full transcript

### Acceptance Criteria
- System identifies action items including owner, due date, and priority
- Summary includes key decisions made during the meeting
- Action items are persisted in the action_items table

* **Priority:** High
* **Story Points:** 8
* **Technical Notes:** Use GPT-4o with a structured prompt requesting JSON output matching the ActionItem entity schema.

---

## US-SYS-04: Semantic Cross-Meeting Search
* **As a:** Executive
* **I want to:** Perform semantic searches across historical meeting data
* **So that:** I can retrieve decision history based on natural language queries instead of keywords

### Acceptance Criteria
- System supports semantic search via natural language queries
- Results return a ranked list of relevant meeting excerpts
- Search functionality is restricted by RBAC access

* **Priority:** Medium
* **Story Points:** 5
* **Technical Notes:** Implement RAG pipeline using Qdrant vector database; store meeting text embeddings (1536 dimensions).

---

## US-SYS-05: External Project Management Tool Sync
* **As a:** Project Manager
* **I want to:** Push extracted action items directly to Jira or Azure DevOps
* **So that:** I can manage the action item lifecycle within our existing team workflow

### Acceptance Criteria
- Ability to map meeting action items to project issues
- Bidirectional status updates between our platform and external tool
- Authentication via API Key/Service Token for third-party systems

* **Priority:** Medium
* **Story Points:** 8
* **Technical Notes:** Implement a provider-pattern integration layer for Jira/ADO REST APIs; handle mapping tables between local UUIDs and external issue IDs.

---

## US-SYS-06: Enterprise SSO and Audit Logging
* **As a:** Admin
* **I want to:** Authenticate users via OIDC/SAML and maintain an audit log
* **So that:** The system adheres to corporate security compliance and enables tracking of all state changes

### Acceptance Criteria
- Login is exclusively handled by Okta/Azure AD
- All state-changing API calls log the actor_id, resource_id, and timestamp
- Audit logs are immutable and stored for compliance auditing

* **Priority:** High
* **Story Points:** 5
* **Technical Notes:** Use Passport.js/Auth0 for OIDC; implement middleware to intercept requests and perform asynchronous audit log writes.

---

