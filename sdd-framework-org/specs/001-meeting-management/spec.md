# spec.md

## 1. Executive Summary & Goals
The **Intelligent Meeting & Action Management Platform** is an enterprise-grade solution designed to automate the lifecycle of organizational meetings. By leveraging Generative AI (LLMs) and Vector Databases, the platform transforms raw meeting data (audio/video/text) into structured, actionable intelligence.

**Core Objectives:**
*   **Efficiency:** Reduce manual documentation by 90%.
*   **Accountability:** Ensure 100% visibility of action items and decision provenance.
*   **Intelligence:** Provide semantic search and AI-driven insights across historical organizational data.
*   **Performance:** Achieve < 30s summary generation and 99.95% system uptime.

---

## 2. User Persona, Actors, and User Flows

### Actors
*   **Employee:** Consumer of data; contributor of meeting content.
*   **Manager:** Orchestrator; tracks progress and team output.
*   **Executive:** Auditor; reviews high-level KPIs and strategic risks.
*   **Administrator:** System overseer; configures security and models.

### Primary User Flow (Meeting to Action)
1.  **Sync:** User connects calendar via OAuth2.
2.  **Capture:** System auto-joins or user uploads recording (MP4/WAV).
3.  **Process:** Audio -> Transcript -> AI Analysis (Summary/Action Extraction).
4.  **Review:** User verifies AI-generated MoM and action items.
5.  **Sync-Out:** Action items pushed to external PM tools (Jira/ADO).
6.  **Reflect:** AI Dashboard updates with new KPIs.

---

## 3. Functional Requirements (Detailed)

| Feature | Input | Logic Gate | Output |
| :--- | :--- | :--- | :--- |
| **AI Summary** | Transcript JSON | Trigger post-processing on transcript completion | Multi-format summary (Exec, Tech, Bus) |
| **Action Extraction** | Meeting transcript | NER/Extraction prompted via LangGraph | Structured `ActionItem` objects |
| **Semantic Search** | Natural language query | Vector search via Qdrant/Embeddings | Relevant meeting/decision snippets |
| **Auth/SSO** | Provider ID Token | Validate JWT/OpenID signature | Authenticated User Session |

---

## 4. Proposed API Schema Contract

### POST /ai/chat
**Description:** Engage in RAG-based chat with specific meeting context.
*   **Headers:** `Authorization: Bearer {token}`, `Content-Type: application/json`
*   **Request JSON:**
    ```json
    { "meeting_id": "uuid", "query": "What was the decision on X?" }
    ```
*   **Response JSON:**
    ```json
    { "response": "The decision was made to...", "references": ["transcript_segment_id"] }
    ```

### POST /actions
**Description:** Create/Sync an action item.
*   **Request JSON:**
    ```json
    { "title": "Setup CI/CD", "owner_id": "uuid", "priority": "high", "due_date": "2023-12-01" }
    ```
*   **Response JSON:**
    ```json
    { "action_id": "uuid", "status": "created", "sync_status": "pending" }
    ```

---

## 5. Data Model Constraints (DDL Expectations)

*   **Meeting Table:** `id UUID PK`, `title VARCHAR(255)`, `start_time TIMESTAMP`, `recording_url TEXT`, `status ENUM('scheduled', 'processing', 'completed')`.
*   **ActionItem Table:** `id UUID PK`, `meeting_id FK`, `owner_id FK`, `priority ENUM('critical', 'high', 'medium', 'low')`, `due_date TIMESTAMP`, `vector_embedding VECTOR(1536)`.
*   **Constraint Rule:** All `owner_id` must reference `User.id` with `ON DELETE CASCADE`.

---

## 6. Compliance & Security Mandates

### Access Control (RBAC)
*   **Admin:** Full CRUD access to settings and user management.
*   **Manager/Employee:** Read access restricted by `Project_ID` scope.
*   **Enforcement:** Every API request must validate `Claims` from the JWT against the requested `Resource_ID`.

### Data Protection
*   **Encryption:** AES-256 for data at rest (PostgreSQL volumes/S3 buckets).
*   **Transport:** Enforced TLS 1.3 for all endpoints.
*   **Audit Logging:** Every mutating request (POST/PUT/DELETE) must write a row to `AuditLog` table containing `actor_id`, `action`, `timestamp`, and `IP_address`.
*   **Session Security:** 30-minute idle session timeout; MFA required for all Administrative actions.