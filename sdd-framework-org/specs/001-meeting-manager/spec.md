# spec.md

## 1. Executive Summary & Goals
The **Intelligent Meeting & Action Management Platform** is an enterprise-grade solution designed to automate the administrative burden of meeting lifecycle management. By leveraging Large Language Models (LLMs) and vector-based semantic search, the platform transforms raw audio/video data into structured organizational knowledge.

**Core Goals:**
*   **Efficiency:** Reduce manual MoM documentation time by 90%.
*   **Visibility:** Provide real-time dashboards for executives to track risks and action closure rates.
*   **Knowledge Retention:** Create a central, queryable repository of all organizational decisions.
*   **Accuracy:** Maintain >95% transcription accuracy and actionable insight extraction.

---

## 2. User Persona, Actors, and User Flows

### Actors
*   **Standard Employee:** Active participant; focuses on personal action items.
*   **Project Manager:** Evaluator; tracks team progress and bottlenecks.
*   **Executive:** Auditor; monitors high-level KPIs and strategic risks.
*   **Administrator:** System overseer; manages integrations and auth policies.

### Key User Flow: Meeting-to-Action
1.  **Ingestion:** User connects Calendar (Outlook/Google). Meeting syncs automatically.
2.  **Processing:** Platform joins meeting or receives file upload.
3.  **Analysis:** System transcribes $\rightarrow$ identifies speakers $\rightarrow$ extracts Actions/Decisions via AI.
4.  **Distribution:** Notifications sent to owners of Action Items via Slack/Email.
5.  **Tracking:** Owner updates status (e.g., "In Progress" to "Completed").

---

## 3. Functional Requirements

| Feature | Input | Logic Gate | Output |
| :--- | :--- | :--- | :--- |
| **Transcription** | Audio file/Stream | Whisper/Deepgram ASR model | Timestamped text + Speaker ID |
| **Action Extraction** | Raw transcript | NER + Intent Classification | JSON object (Owner, Due Date, Task) |
| **Semantic Search** | Natural language query | Vector embedding (Qdrant) | Relevant meeting segments/Docs |
| **Risk Detection** | Transcript/Decisions | Pattern matching + Sentiment | Risk level (High/Med/Low) + Type |

---

## 4. API Schema Contract (Example: Actions)

**Endpoint:** `POST /api/v1/actions`
**Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`

**Request JSON:**
```json
{
  "title": "Finalize Q4 Budget",
  "owner_email": "jane@company.com",
  "due_date": "2023-12-31T23:59:59Z",
  "priority": "Critical",
  "meeting_id": "uuid-123"
}
```

**Response JSON:**
```json
{
  "action_id": "act-9988",
  "status": "created",
  "created_at": "2023-10-27T10:00:00Z"
}
```

---

## 5. Data Model Constraints

*   **Users:** `id (PK), email (UQ), sso_id, role, department`
*   **Meetings:** `id (PK), organizer_id (FK), start_time, end_time, status`
*   **ActionItems:** 
    *   `id (PK), meeting_id (FK), owner_id (FK)`
    *   `status (ENUM: OPEN, IN_PROGRESS, BLOCKED, COMPLETED)`
    *   `priority (ENUM: CRITICAL, HIGH, MEDIUM, LOW)`
*   **Embeddings:** `id (PK), document_id, vector (Vector/Array[1536])`

---

## 6. Compliance & Security Mandates

### Access Control (RBAC)
*   **Hierarchy:** `ADMIN > EXEC > PM > EMPLOYEE`.
*   **Policy:** Employees only access meetings where they are listed as a participant or invitee. PMs access their Project scope. Administrators have full system read/write access.

### Security
*   **Encryption:** 
    *   At Rest: AES-256 for all PII and meeting transcripts.
    *   In Transit: TLS 1.3 enforced for all API communications.
*   **Authentication:** 
    *   SSO mandatory (OIDC/SAML).
    *   MFA enforcement for all users with "Manager" or "Admin" roles.
    *   JWT token expiration: 60 minutes with sliding window refresh.
*   **Audit Logging:** Every administrative action, AI query, and data export must be logged in the `AuditLog` table with timestamp, user ID, and IP address.