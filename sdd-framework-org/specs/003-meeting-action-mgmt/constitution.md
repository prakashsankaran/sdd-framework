# constitution.md

## 1. Project Philosophy & Core Principles
This platform is built upon a foundation of operational excellence and user-centric design. All development decisions must align with these pillars:

*   **User-First Workflow:** Every interaction must minimize friction. If an AI task takes more than two clicks or requires complex input, the UX design is failing.
*   **Secure-by-Default:** Data privacy is paramount. PII and enterprise secrets are encrypted at rest and in transit. Access controls (RBAC) are enforced at the API layer, never just the UI.
*   **AI-Augmented, Human-Controlled:** The platform acts as a co-pilot. All AI-generated outputs (MoM, action items) must be reviewable and editable by human users to maintain institutional trust.
*   **Scalable & Resilient:** Systems must be designed for horizontal scalability. With a target of 100,000 concurrent users, all processing (especially transcription and summarization) must be offloaded to asynchronous background workers.
*   **Semantic Search Readiness:** All meeting content is treated as high-value knowledge. Data ingestion must include vectorization as a first-class citizen in the data pipeline.

## 2. Technology Stack Guidelines
Standardization is mandatory to ensure maintainability and rapid onboarding.

*   **Frontend:**
    *   Framework: **React** with **Vite** for optimized build times.
    *   Styling: **Tailwind CSS** for utility-first, consistent design systems.
    *   State Management: React Query (TanStack Query) for server-state synchronization.
*   **Backend & Queue:**
    *   Runtime: **Node.js** with **Express.js**.
    *   Architecture: RESTful APIs following OpenAPI/Swagger specifications.
    *   Task Queue: BullMQ or equivalent (backed by Redis) is required for all heavy-lifting tasks (transcription, AI summarization, email dispatch).
*   **Database:**
    *   Primary Store: **PostgreSQL**. Use relational integrity to enforce strict consistency for Users, Meetings, and Actions.
    *   Vector Store: **Qdrant** for semantic search and RAG operations.
    *   Caching: **Redis** for session management and frequently accessed API responses.

## 3. Architectural Boundaries & Rules

### Data Separation
*   **The AI/Data Pipeline:** Transcription and AI processing must run in isolated worker services. The primary web server must never perform blocking I/O for AI calls.
*   **Context Isolation:** Database schemas must enforce strict tenant/project scoping. A user’s query must be restricted to the projects/meetings they have permission to access via RBAC middleware.

### Communication Protocols
*   **Internal Service Auth:** All internal service-to-service communication must be authenticated via internal JWT or mutual TLS.
*   **API Contract:** No API shall be deployed without a corresponding Zod/Joi schema validation. All inputs must be sanitized to prevent injection attacks.

### Workflow & Quality
*   **Git Flow:** Feature branches must be linked to JIRA/ADO tickets. Merge Requests require at least one approval and passing status for all CI/CD pipeline checks.
*   **Logging & Observability:** All services must emit structured logs. No exceptions shall be swallowed; all errors must be logged with context and stack trace to the centralized observability platform (Grafana/Prometheus).
*   **Environment Parity:** Infrastructure must be defined as code (Terraform/Docker Compose). Development, Staging, and Production environments must remain functionally identical.