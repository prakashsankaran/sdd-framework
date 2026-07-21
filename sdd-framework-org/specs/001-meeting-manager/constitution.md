```markdown
# Project Constitution: Intelligent Meeting & Action Management Platform

This document serves as the foundational "Source of Truth" for the development, architecture, and engineering culture of the project. All architectural decisions, pull requests, and implementations must align with these principles.

---

## 1. Core Principles

### User-First & Intentional Design
- **Value Over Noise:** Every AI output must provide actionable insight. Reduce cognitive load by prioritizing relevant tasks and decisions in the user interface.
- **Accessibility:** All interfaces must adhere to WCAG 2.2 AA standards from Day 1.
- **Seamless Flow:** The application should integrate into existing user workflows (Slack, Teams, Jira) rather than forcing users to context-switch into the platform.

### Secure-by-Default
- **Privacy First:** Data must be encrypted at rest (AES-256) and in transit (TLS 1.3). 
- **Zero Trust:** Every API request must be authenticated via OAuth2/JWT. RBAC (Role-Based Access Control) is strictly enforced at the database and application levels.
- **Auditability:** Every action taken on entities (Meetings, Actions, Decisions) must be logged for auditability and compliance.

### Scalable & Resilient
- **High Availability:** Architecture must target 99.95% uptime through load balancing and horizontal scaling via Kubernetes.
- **Observability:** Centralized logging and real-time monitoring (Prometheus/Grafana) are mandatory. Systems must be debuggable in production.
- **Loose Coupling:** Services must communicate via well-defined REST APIs or asynchronous event buses to ensure modularity.

---

## 2. Tech Stack Guidelines

### Frontend
- **Framework:** React with Vite for fast build times and HMR.
- **Language:** TypeScript (Strict mode enabled).
- **Styling:** Tailwind CSS for design consistency and utility-first styling.
- **State Management:** React Query (TanStack Query) for server state; Context API or Zustand for global UI state.

### Backend & Processing
- **API Services:** Node.js with Express.js for the core API layer, ensuring high performance and non-blocking I/O.
- **Data Layer:** PostgreSQL (Primary Relational Database) for structured entities (Users, Meetings, Actions).
- **Queue/Async:** Redis as the message broker for background job processing (transcription, AI summary generation, notifications).
- **Search:** Qdrant as the Vector Database for RAG (Retrieval-Augmented Generation) and semantic meeting search.

---

## 3. Architectural Boundaries & Rules

### Domain Separation
- **Separation of Concerns:** The Business Logic layer must remain decoupled from the AI/LLM orchestration layer. 
- **AI Abstraction:** All interactions with AI models (OpenAI, Azure, Claude) must pass through a service abstraction layer. This allows switching providers without refactoring core business logic.

### Database Rules
- **Schema Integrity:** All relational data must follow normalized schema design. No logic should be embedded in the database; strictly use PostgreSQL for storage and constraints.
- **Idempotency:** All API operations must be designed to be idempotent where possible.

### Development Workflow
- **Code Quality:** Mandatory ESLint and Prettier configurations. CI/CD pipelines will fail if code coverage falls below 80% or linting fails.
- **Branching:** Feature-branch workflow. All merges to `main` must require a Pull Request, peer review, and successful CI pipeline completion.
- **Documentation:** Every API endpoint must be documented via OpenAPI/Swagger.

### AI Constraints
- **Context Management:** AI inputs must be sanitized to ensure no PII (Personally Identifiable Information) leaks into non-enterprise models.
- **Determinism:** Where possible, enforce system prompts to ensure consistent output formats (JSON) for downstream consumption by the platform.
```