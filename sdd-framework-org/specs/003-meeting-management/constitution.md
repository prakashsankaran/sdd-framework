```markdown
# Project Constitution: Intelligent Meeting & Action Management Platform

## 1. Core Principles
The development and evolution of this platform are governed by the following pillars:

*   **User-First Design:** Every feature must reduce cognitive load. The AI should assist, not replace, human intent. Interfaces must be intuitive, requiring minimal onboarding.
*   **Secure-by-Default:** Security is not an afterthought. Data privacy, encryption (at rest/transit), and granular RBAC are foundational. We follow a "zero-trust" approach to internal data access.
*   **Scalable Architecture:** The system must handle high concurrency (up to 100k users) through decoupled services, efficient caching, and optimized vector search.
*   **Transparency & Traceability:** Every AI-generated summary or action item must be traceable back to the source transcript. Audit logs must capture every system modification.
*   **Extensibility:** The platform must favor plugin-based integration architectures to allow for future additions of new meeting platforms, LLM providers, and storage backends.

## 2. Technology Stack Guidelines
All development must adhere to the following approved technology stack to ensure maintainability and performance:

*   **Frontend:** React with Vite, utilizing TypeScript for type safety and Tailwind CSS for utility-first styling.
*   **Backend:** Node.js with Express.js. All business logic, API orchestration, and queue management shall be handled here.
*   **Database:** PostgreSQL (Relational) as the primary source of truth for structured data (Users, Meetings, Actions).
*   **Intelligence Layer:** Qdrant (Vector Database) for semantic search and RAG (Retrieval-Augmented Generation) storage.
*   **State Management/Caching:** Redis for session management, job queuing, and transient data caching.
*   **AI Orchestration:** LangChain/LangGraph for managing complex agentic workflows and LLM interactions.

## 3. Architectural Boundaries & Rules

### Data & State
*   **Single Source of Truth:** All transactional data must reside in PostgreSQL. Vector embeddings must be synchronized with PostgreSQL records.
*   **Immutability of Transcripts:** Once a transcript is generated and finalized, the raw text should be treated as immutable. Any AI edits should be stored as versioned "overlays" or "refinements."

### API Design
*   **RESTful Standards:** All APIs must follow standard REST conventions. Response formats must be consistent (JSON-only).
*   **Authentication:** All endpoints (except public health checks) must be protected via JWT issued through the SSO provider (Azure/Google).
*   **Rate Limiting:** All AI-heavy endpoints (summarization, chat) must implement strict rate limiting to prevent unauthorized usage and control API costs.

### AI Ethics & Interaction
*   **Attribution:** AI-generated outputs (Minutes, Action Items) must display a confidence score or source-reference links.
*   **Non-Determinism Handling:** Given the nature of LLMs, all system prompts must be version-controlled in the repository, not hardcoded in the application logic.

### Development Workflow
*   **Code Quality:** Every PR must be accompanied by unit/integration tests. Coverage must be maintained above 80%.
*   **Environment Parity:** Infrastructure must be defined as code (IaC) to ensure development, staging, and production environments are functionally identical.
*   **Documentation:** Every API endpoint must be documented using OpenAPI/Swagger annotations within the source code.

### Security Boundaries
*   **Encryption:** No PII (Personally Identifiable Information) shall be logged in plain text.
*   **Isolation:** The AI execution layer must operate in an isolated environment with restricted access to the broader production database.
```