# plan.md

## 1. Architecture Summary
The platform adopts a **Microservices-ready Modular Monolith** architecture, shifting to microservices as the user load scales. 
- **Frontend:** SPA built with React/TypeScript for high interactivity.
- **Backend:** FastAPI for asynchronous handling of AI-heavy tasks.
- **AI Engine:** RAG (Retrieval-Augmented Generation) pipeline using Qdrant for semantic search and LangChain/LangGraph for multi-step reasoning.
- **Data Layer:** PostgreSQL for relational data (users, actions) and Qdrant for vector embeddings of meeting transcripts.
- **Event Bus:** Redis for task queuing (transcription/summary jobs).

---

## 2. Components & Directory Structure

```text
/platform
├── /api              # FastAPI modules
│   ├── /routes       # Endpoints (auth, meetings, ai, actions)
│   ├── /services     # Business logic (transcription, RAG, summary)
│   └── /schemas      # Pydantic models
├── /core             # Security, Auth (OAuth2), Config
├── /db               # Migrations (Alembic), Models (SQLAlchemy)
├── /ai               # LangGraph workflows, Prompt templates
├── /worker           # Background task processing (Celery)
├── /frontend         # React/Tailwind source
└── /tests            # Pytest and Playwright suites
```

---

## 3. Phased Implementation Schedule

### Phase 1: Core Foundation (Weeks 1-4)
- Set up FastAPI project structure, Postgres, and Redis.
- Implement Authentication (Azure AD/SSO) and RBAC middleware.
- Basic CRUD for Meetings and Actions.
- Calendar integration (Google/Outlook APIs).

### Phase 2: AI Pipeline & Processing (Weeks 5-8)
- Integration with Whisper (transcription) and Azure OpenAI.
- Speaker Identification and Diarization logic.
- RAG pipeline: Embedding transcripts into Qdrant.
- AI Summary and Action extraction service.

### Phase 3: Action & Decision Management (Weeks 9-10)
- Dashboard UI implementation.
- Notification system (Slack/Teams/Email).
- Advanced semantic search interface.

### Phase 4: Integrations & Reporting (Weeks 11-12)
- External integrations (Jira, Confluence, Monday.com).
- Export functionality (PDF/Excel).
- Load testing and security audit (TLS 1.3, Encryption).

---

## 4. Verification Plan

### Automated Testing
- **Unit Tests:** `pytest` covering all business logic (e.g., action item status transitions).
- **Integration Tests:** API tests verifying end-to-end flow from transcription upload to RAG retrieval.
- **Performance:** `Locust` scripts to simulate concurrent AI summary requests.

### Verification Scripts
- **Data Consistency:** Script to check for orphaned transcripts or unlinked action items.
- **Security:** Automated script scanning JWT validity and RBAC permission enforcement.

### Manual Validation Flows
1. **Flow A (The Happy Path):** Upload MP4 -> Trigger Transcription -> Verify Speaker labels -> Verify AI generates actionable items -> Check DB for saved metadata.
2. **Flow B (Search):** Perform a natural language query in the "AI Copilot" and verify against known meeting context.
3. **Flow C (Integration):** Create a Meeting -> Assign Action -> Verify it appears in the connected Trello/Jira board.

### Quality Metrics Tracking
- **Transcription Accuracy:** Compare AI transcript against golden transcript set (target 95%).
- **Latency:** Capture `X-Process-Time` headers in API responses to ensure `< 2s` page loads.