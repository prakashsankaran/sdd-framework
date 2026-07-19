# spec.md

## 1. Executive Summary & Goals
The **Intelligent Meeting & Action Management Platform** is an enterprise-grade solution designed to automate the meeting lifecycle. By leveraging Large Language Models (LLMs) and Vector Database retrieval (RAG), the system transforms raw audio into structured business intelligence.
*   **Primary Goal:** 90% reduction in manual documentation overhead.
*   **Core Value Prop:** Centralized decision repository and automated action item lifecycle management.
*   **Key KPI:** System-wide action item closure rate increase of 80%.

---

## 2. User Personas & Flows
*   **Executive:** High-level oversight. Flow: Login -> View Executive Dashboard -> Drill down into Risk/KPI trends -> Use Semantic Search for decision history.
*   **Project Manager:** Operational oversight. Flow: Integrate Calendar -> Link Meeting to Jira/DevOps -> Review AI-generated MoM -> Assign action owners -> Track status updates.
*   **Employee:** Participant/Executor. Flow: Join meeting -> Receive "Summary Ready" notification -> View assigned Action Items -> Update status to "Completed" via dashboard.

---

## 3. Functional Requirements
| Feature | Logic/Input | Processing Rule | Output |
| :--- | :--- | :--- | :--- |
| **Transcription** | Audio file (MP3/WAV) | Whisper API / ASR service | JSON with Timestamps, Speaker IDs, Text. |
| **Action Extraction** | Meeting Transcript | LLM Prompt (extract `owner`, `due`, `priority`) | `ActionItem` Entity records. |
| **Semantic Search** | Natural Language Query | Embeddings via Qdrant | Ranked list of relevant meeting excerpts. |
| **AI Chat** | Query regarding specific meeting | Context window: Transcript + Summary | Natural language response with citations. |

---

## 4. API Schema Contracts

### POST /api/v1/meetings/summary
*   **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
*   **Request:** `{"meeting_id": "uuid", "model": "gpt-4o"}`
*   **Response:** `{"summary": "string", "key_decisions": [], "action_items": []}`

### GET /api/v1/actions
*   **Headers:** `Authorization: Bearer <JWT>`
*   **Response:** `{"actions": [{"id": "uuid", "status": "open", "due_date": "ISO8601"}]}`

---

## 5. Data Model Constraints (DDL Expectations)

```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY,
    owner_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    metadata JSONB, -- Stores tags and meeting context
    vector_embedding VECTOR(1536) -- For semantic indexing
);

CREATE TABLE action_items (
    id UUID PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id),
    title TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Open', 'In Progress', 'Blocked', 'Completed', 'Cancelled')),
    due_date DATE,
    priority VARCHAR(10) CHECK (priority IN ('Critical', 'High', 'Medium', 'Low'))
);
```

---

## 6. Compliance & Security Mandates

### Role-Based Access Control (RBAC)
*   **Admin:** Full CRUD on system configurations and user roles.
*   **Manager:** Read/Write access to project-linked meetings and actions.
*   **Employee:** Read access to meeting summaries; Write access to assigned actions.

### Technical Mandates
*   **Encryption:** All PII and meeting data encrypted at rest via **AES-256**. All transit traffic must use **TLS 1.3**.
*   **Auth:** Mandatory **OIDC/SAML** integration with Azure AD/Okta. No local credential storage for enterprise clients.
*   **Auditability:** Every API interaction resulting in a state change must log `actor_id`, `timestamp`, `resource_id`, and `action_type` to the `AuditLog` table.
*   **Data Residency:** Containerized deployment supports VPC-peering to ensure data never leaves the client's cloud boundary (Azure/AWS).