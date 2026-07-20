# plan.md

## 1. Architecture Summary
The platform follows a **Microservices-ready Modular Monolith** architecture, prioritizing scalability and AI integration.
- **Frontend:** React SPA with Tailwind CSS.
- **Backend:** FastAPI (Async) for high-concurrency request handling.
- **AI/LLM Layer:** Orchestrated via LangGraph/LangChain, utilizing a Vector Database (Qdrant) for RAG (Retrieval-Augmented Generation) to power the "AI Copilot."
- **Data Layer:** PostgreSQL (Relational metadata) + Redis (Caching/Session) + S3/Blob (Binary storage for recordings/transcripts).
- **Security:** OAuth2/OIDC middleware integrated with Identity Providers (Azure/Google).

---

## 2. Components & Directory Structure
```text
/root
├── /backend
│   ├── /app
│   │   ├── /api/v1/endpoints (Meetings, Actions, AI, Auth)
│   │   ├── /core (Security, Config, Logging)
│   │   ├── /services (LLM Logic, RAG Engine, Integration Hub)
│   │   ├── /models (SQLAlchemy/Pydantic schemas)
│   │   └── /db (Postgres connection, Qdrant Vector client)
├── /frontend
│   ├── /src
│   │   ├── /components (Reusable UI)
│   │   ├── /hooks (Auth, Data fetching)
│   │   └── /pages (Dashboard, MeetingDetail, ActionCenter)
├── /infra
│   ├── docker-compose.yml
│   └── k8s (Deployment manifests)
```

---

## 3. Phased Implementation Schedule

### Phase 1: Foundation & Auth (Weeks 1-3)
- Setup CI/CD, FastAPI boilerplate, and PostgreSQL/Redis.
- Implement User/Organization/Role management.
- Integration: Azure/Google SSO.

### Phase 2: Meeting Ingestion & Transcription (Weeks 4-7)
- Calendar integration (Graph API/Google API).
- Recording upload service and storage (S3).
- Integration with Speech-to-Text provider (e.g., OpenAI Whisper).

### Phase 3: AI Intelligence Layer (Weeks 8-12)
- Implement RAG pipeline (Qdrant ingestion).
- Develop LangGraph flows for MoM, Action Extraction, and Sentiment Analysis.
- Build "AI Copilot" chat interface.

### Phase 4: Action & Decision Management (Weeks 13-15)
- Full CRUD for Action Items and Decision Registry.
- Implement Notification Engine (Slack/Teams/Email webhooks).

### Phase 5: Dashboards & Reporting (Weeks 16-18)
- Develop Aggregated KPI views.
- Implement PDF/Excel report export engine.
- UAT and Stress Testing (100k user simulation).

---

## 4. Verification Plan

### Automated Testing
- **Unit Tests:** PyTest for all AI extraction logic and service layer functions.
- **Integration Tests:** Test REST API flows (End-to-end meeting recording to summary generation).
- **Performance Testing:** Use K6/Locust to verify the 2s page load and concurrency requirements.

### Test Routes
- `GET /health`: System heartbeat.
- `POST /test/trigger-mock-meeting`: Simulates an incoming webhook from Zoom/Teams.
- `GET /test/verify-rag-context`: Query Qdrant directly to ensure semantic mapping is correct.

### Manual Validation Flows
1. **End-to-End Meeting Flow:** Schedule meeting -> Upload Audio -> Verify Transcription -> Verify AI Summary generation -> Create Action item from AI -> Verify Notification reception.
2. **Security Audit:** Verify JWT token expiry, IP restriction enforcement, and RBAC permission sets (Employee vs. Executive views).
3. **Semantic Search:** Execute "Show meetings about Azure migration" and verify that relevant chunks are retrieved from the Vector Database.