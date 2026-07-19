# spec.md

## 1. Executive Summary & Goals
The **Intelligent Meeting & Action Management Platform** is an enterprise-grade solution designed to automate the lifecycle of professional meetings. By leveraging Generative AI and RAG (Retrieval-Augmented Generation), the platform aims to eliminate manual documentation overhead by 90% and centralize organizational decision-making.

**Primary Goals:**
*   **Automation:** End-to-end transcription, summarization, and action item extraction.
*   **Intelligence:** Semantic search across organizational history and AI-driven predictive insights.
*   **Accountability:** Real-time action tracking with integration into existing project management tools (Jira, DevOps).
*   **Scalability:** High-availability architecture supporting 100,000+ concurrent users.

---

## 2. User Personas, Actors, and User Flows

### Personas
*   **Individual Contributor:** Focused on personal productivity and task management.
*   **Project Manager:** Focused on team velocity, blockers, and project progress.
*   **Executive:** Focused on strategic decisions, KPI tracking, and high-level risk management.

### Key User Flow: Meeting-to-Action Lifecycle
1.  **Sync:** System imports meeting via Calendar integration.
2.  **Capture:** System captures audio; handles stream/upload.
3.  **Process:** Transcriber generates text; AI identifies speakers and partitions discussion.
4.  **Extract:** AI models extract Action Items and Decisions, mapping them to the `ActionItem` entity.
5.  **Review:** User verifies summary; changes status of action items.
6.  **Push:** Actions are synced to external tools (e.g., Jira) via Webhook.

---

## 3. Functional Requirements

| Feature | Input | Logic/Rule | Output |
| :--- | :--- | :--- | :--- |
| **Transcription** | Audio stream/file | Diarization & confidence filtering | Timestamped text JSON |
| **AI Summary** | Full Transcript | Summarize based on meeting type (Executive/Technical) | Structured Markdown |
| **Action Extraction** | Meeting Context | LLM must identify: Owner, Due Date, Priority | `ActionItem` Object |
| **Semantic Search** | Natural Language Query | Vector embedding search in Qdrant | Relevant meeting segments |

---

## 4. API Schema Contract (Sample)

### POST /api/v1/meetings/process
**Description:** Initiates the AI pipeline for a specific meeting.

*   **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
*   **Request JSON:**
    ```json
    { "meeting_id": "uuid", "provider": "zoom", "transcript_url": "s3://path/to/file" }
    ```
*   **Response JSON:**
    ```json
    { "status": "processing", "job_id": "uuid", "estimated_completion": "30s" }
    ```

---

## 5. Data Model Constraints (DDL Expectations)

```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    transcript_blob TEXT,
    summary JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE action_items (
    id UUID PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id),
    title VARCHAR(500),
    owner_email VARCHAR(255),
    due_date TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('Open', 'In Progress', 'Completed', 'Blocked', 'Cancelled')),
    priority VARCHAR(20) CHECK (priority IN ('Critical', 'High', 'Medium', 'Low'))
);
```

---

## 6. Compliance & Security Mandates

### Security Architecture
*   **Role-Based Access Control (RBAC):** Every API request must validate user scopes (e.g., `ROLE_EXECUTIVE` can access global reports; `ROLE_EMPLOYEE` limited to assigned project scope).
*   **Data Protection:**
    *   **At Rest:** AES-256 encryption on all volumes (Azure/AWS managed keys).
    *   **In Transit:** TLS 1.3 enforced for all internal/external communication.
*   **Audit Logging:** Every state change in `ActionItem` or `Decision` tables must trigger an `AuditLog` entry capturing `ActorID`, `Timestamp`, and `ChangeDiff`.
*   **Auth:** Mandatory MFA through OIDC providers (Azure AD/Okta).
*   **Accessibility:** UI compliance with WCAG 2.2 AA (high-contrast mode, screen reader support for summaries).