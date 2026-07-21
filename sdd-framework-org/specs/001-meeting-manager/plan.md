# plan.md

## 1. Architecture Summary
The platform follows a **Microservices-ready Modular Monolith** architecture, transitioning to microservices as load scales. 
- **Frontend:** React SPA with TypeScript.
- **Backend:** FastAPI for asynchronous request handling (ideal for LLM streaming).
- **Persistence:** PostgreSQL for relational data, Qdrant for semantic vector search (RAG).
- **AI Orchestration:** LangGraph to manage complex stateful agent workflows (transcription -> summary -> action extraction).
- **Infrastructure:** Containerized via Docker/Kubernetes, utilizing Redis for task queuing (Celery) to handle long-running transcription jobs.

---

## 2. Components & Directory Structure
```text
/src
  /api              # FastAPI routes (v1/meetings, v1/ai, v1/actions)
  /core             # Security (JWT, RBAC), Config, Database connections
  /services         # Business logic: MeetingService, ActionService
  /ai               # LangGraph nodes, Prompt templates, RAG integration
  /workers          # Celery workers for transcription & AI processing
  /models           # SQLAlchemy Pydantic models
/web
  /components       # UI components (Dashboard, MeetingCard, Chat)
  /hooks            # Auth and API hooks
/infra
  /docker-compose   # Dev environment
  /k8s              # Production manifests
```

---

## 3. Phased Implementation Schedule

### Phase 1: Core Foundation (Weeks 1-4)
- Setup FastAPI, PostgreSQL, and Auth (Azure/Google SSO).
- Database schema implementation (User, Meeting, ActionItem entities).
- Basic CRUD for Meetings and Actions.
- Frontend scaffold and CI/CD pipeline setup.

### Phase 2: AI Pipeline & Integration (Weeks 5-8)
- Integration with Whisper (transcription) and LLMs (Azure OpenAI/Claude).
- Implement LangGraph workflow for automated summary and action extraction.
- Integrate Qdrant for semantic search.
- Implement Webhooks for Zoom/Teams recording imports.

### Phase 3: Action Management & Dashboard (Weeks 9-12)
- Notification engine (Slack/Teams/Email integration).
- Executive/Employee dashboards with KPI widgets.
- Reporting export logic (PDF/Excel generation).
- Audit logging and RBAC enforcement.

---

## 4. Verification Plan

### Automated Testing
- **Unit Tests:** `pytest` for AI extraction logic (mocking OpenAI responses).
- **Integration Tests:** `httpx` to verify API flow (Meeting Created -> Transcribed -> Action Extracted).
- **Schema Validation:** Ensure Pydantic models align with DB constraints.

### Test Routes
- `GET /health`: System heartbeat.
- `POST /ai/test-flow`: Trigger mock audio file processing to verify end-to-end AI extraction.
- `GET /metrics`: Prometheus endpoint check.

### Manual Validation Flows
1. **The "Full Loop" Test:**
   - Schedule a meeting via Calendar integration.
   - Upload/Import recording.
   - Verify: Transcript appears -> AI generates summary -> Action items auto-populate in Dashboard.
   - Perform: Update an Action status and confirm notification is received in Slack/Email.
2. **The "Executive Search" Test:**
   - Use natural language query (e.g., "Show me blockers for Project Alpha").
   - Verify accuracy of retrieved data using RAG results.
3. **RBAC Test:**
   - Login as "Employee" and attempt to access `POST /admin/settings` (Expect 403 Forbidden).