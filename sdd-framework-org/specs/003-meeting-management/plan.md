# plan.md

## 1. Architecture Summary
The platform follows a **Microservices-ready Modular Monolith** approach. 
- **Frontend:** React (SPA) with Tailwind for responsive UI.
- **Backend:** FastAPI (Async) utilizing a Repository pattern for data access.
- **AI Orchestration:** LangGraph/LangChain layer to manage stateful LLM interactions and RAG pipelines.
- **Persistence:** PostgreSQL for relational data; Qdrant for semantic vector search; Redis for caching and background task queuing (Celery/RQ).
- **Communication:** WebSockets for real-time notifications and live meeting transcription updates.

---

## 2. Components, Directories, and Files

### Directory Structure
```text
/src
  /api              # REST endpoints (auth, meetings, actions, ai)
  /services         # Business logic (transcription, action_extraction, integration)
  /core             # Config, security (RBAC), database connection
  /models           # SQLAlchemy ORM models
  /llm              # LangGraph workflows and prompts
  /utils            # Encryption, logging
/tests              # Pytest units and integration tests
/frontend           # React components/pages
```

### Key Files to Create/Modify
- `models/`: `user.py`, `meeting.py`, `action.py`, `embedding.py`
- `llm/`: `summarizer.py`, `agent_manager.py`, `rag_engine.py`
- `api/routes/`: `meeting_routes.py`, `ai_routes.py`, `action_routes.py`
- `services/`: `transcription_service.py`, `sync_service.py` (for Jira/Teams integrations)

---

## 3. Phased Implementation Schedule

### Phase 1: Foundation (Weeks 1-3)
- Setup FastAPI, PostgreSQL, and Qdrant.
- Implement RBAC and OAuth2/Azure AD authentication.
- Create core CRUD for `Meetings` and `Users`.
- Setup Docker/K8s infrastructure.

### Phase 2: AI & Data Pipeline (Weeks 4-7)
- Integrate Whisper/Azure Speech for transcription.
- Implement `LangGraph` agents for Action/Decision extraction.
- Enable RAG pipeline: Meeting transcripts -> Embeddings -> Qdrant.
- Create `AI Copilot` chat endpoint.

### Phase 3: Integration & Management (Weeks 8-10)
- Build connectors for Outlook/Google Calendar and Jira/Slack.
- Implement `ActionItem` lifecycle management.
- Develop Notification service (WebSockets/Email).

### Phase 4: Analytics & Polish (Weeks 11-12)
- Build Dashboards (React + Recharts).
- Generate PDF/CSV report exports.
- Performance tuning (caching with Redis) and UAT.

---

## 4. Verification Plan

### Automated Testing
- **Unit Tests:** `pytest` for business logic (e.g., calculation of meeting duration, action status transition).
- **Integration Tests:** Test external API calls (Jira/Outlook) using `pytest-mock`.
- **API Tests:** FastAPIs `TestClient` for all endpoints in `18. REST APIs`.

### Test Routes/Endpoints
- `GET /health`: Connectivity check.
- `POST /test/trigger-mock-meeting`: Injects a synthetic transcript to verify AI extraction pipeline.

### Manual Validation Flows
1. **End-to-End Meeting:** Upload MP4 -> Verify Transcription -> Verify Action Extraction -> Assign to user -> Check Notification.
2. **Knowledge Query:** Ask "What did we decide regarding Project X?" -> Verify RAG returns accurate context.
3. **Security:** Attempt to access `GET /meetings` with a token missing the `read:meetings` scope.
4. **Dashboard:** Verify Executive Dashboard calculates correct KPIs after 5+ mock meetings are processed.