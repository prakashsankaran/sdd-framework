# constitution.md

## 1. Project Philosophy & Core Principles
This platform is built on the following foundational tenets:

*   **User-First Interaction:** AI must act as an assistant, not a gatekeeper. Features prioritize clarity, reducing cognitive load, and providing actionable insights over raw data volume.
*   **Secure-by-Default:** Security is not an add-on. Every API endpoint, database query, and AI prompt must adhere to the principle of least privilege. Data must be encrypted at rest and in transit.
*   **Scalable Architecture:** The system must support 100,000 concurrent users. All components must be stateless, horizontally scalable, and optimized for high-throughput AI processing.
*   **Actionability over Noise:** The platform exists to drive progress. If an AI output does not lead to a decision, an action, or a reduction in manual work, it is considered noise.
*   **Observability First:** Every system action—from transcription to AI generation—must be traceable, logged, and monitored to ensure accountability and debugging capability.

## 2. Technology Stack Guidelines
All development must adhere to the following stack specifications to ensure maintainability and performance:

*   **Frontend:** React with Vite, utilizing TypeScript for type safety. Styling is strictly managed via Tailwind CSS for consistency. State management should prioritize efficiency (e.g., TanStack Query for server state).
*   **Backend & APIs:** Node.js with Express.js for the primary application layer. All services must be written in TypeScript. RESTful conventions must be strictly followed with OpenAPI/Swagger documentation generated for all endpoints.
*   **Background Processing:** Any long-running tasks (transcription, AI summarization, report generation) must be offloaded to a task queue (e.g., BullMQ with Redis) to keep API response times under 2 seconds.
*   **Database:** PostgreSQL is the single source of truth for all structured relational data. All schemas must be version-controlled via migrations.
*   **Vector Infrastructure:** Qdrant must be used for all semantic search and RAG (Retrieval-Augmented Generation) capabilities.

## 3. Architectural Boundaries & Rules

### Data Management
*   **Relational Integrity:** Core business logic (Users, Projects, Meetings, Actions) resides strictly within PostgreSQL.
*   **Embeddings Policy:** Vector data in Qdrant must be ephemeral or synced with source PostgreSQL entities. Never store raw user PII in the vector database.
*   **PII Masking:** AI models should only receive context relevant to the query. Sensitive data must be filtered or anonymized before being sent to third-party LLM providers.

### API Standards
*   **Contract-First Development:** API changes must be documented via `.yaml` or `.json` schemas before implementation.
*   **Authentication:** All requests must be validated via JWTs issued through the SSO provider (Azure/Google/Okta).
*   **Versioning:** All APIs must be versioned (e.g., `/api/v1/...`).

### AI & LLM Governance
*   **Prompt Engineering:** Prompts must be versioned and stored in a central repository. No hardcoded prompts in the business logic.
*   **Guardrails:** All AI responses must pass through an input/output validation layer to prevent hallucinations and ensure adherence to organizational policies.
*   **Statelessness:** AI chat sessions must be stateless; all historical context must be retrieved from the database/vector store per request.

### Quality Assurance
*   **Test Coverage:** Minimum 80% code coverage for all backend logic.
*   **Deployment:** CI/CD pipelines must include automated linting, type-checking, and integration tests before any environment deployment.
*   **Logging:** Centralized logging (ELK stack or equivalent) is required; logs must include a unique `request_id` to trace activity across microservices.