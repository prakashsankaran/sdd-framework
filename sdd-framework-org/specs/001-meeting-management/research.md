```markdown
# Research: Architectural Strategy & Technical Options

## 1. Summary of Stack Constraints
The proposed stack (FastAPI, React, PostgreSQL, Qdrant) is well-suited for high-throughput AI applications. However, specific constraints must be addressed:

*   **Async/Sync Mismatch:** FastAPI is asynchronous by nature, but many LangChain/LangGraph operations and older database drivers can block the event loop. Strict use of `async` drivers (e.g., `asyncpg`) is mandatory.
*   **Vector Database Scaling:** Qdrant is performant, but keeping vector embeddings in sync with PostgreSQL (the source of truth) requires a robust transactional outbox pattern to prevent data drift.
*   **Model Latency:** Using Azure OpenAI or Claude requires handling API timeouts gracefully. The 30-second summary requirement necessitates an asynchronous background task queue (Celery/RabbitMQ or Dramatiq) rather than direct request-response processing.
*   **Frontend State:** With 100,000 concurrent users, React's state management will require optimization (TanStack Query) to prevent excessive re-renders during live transcription streaming.

## 2. Evaluation of Integration Challenges
Integrating with external platforms (Zoom, Teams, Jira) introduces high volatility:

*   **OAuth Lifecycle:** Managing multi-tenant tokens for Google/Microsoft/Slack is complex. **Gotcha:** Access tokens expire frequently; implement a centralized token refresh service that updates the database before the next scheduled background task.
*   **Webhooks & Error Handling:** 
    *   *Edge Case:* Webhook latency. If an "Action Assigned" webhook arrives before the meeting transcription is finished, the system must support "Pending" states to avoid data loss.
    *   *Error Handling:* Implement exponential backoff for failed API calls to Jira/DevOps. If a project management tool is down, the system must buffer the action items locally and retry rather than failing the meeting sync.
*   **Platform API Limits:** Microsoft Teams and Zoom have strict rate limits on meeting recording downloads. **Recommendation:** Implement a prioritized queue (e.g., higher priority for "Executive" or "Urgent" meetings) to avoid hitting 429 (Too Many Requests) errors.

## 3. Recommendations for Scaling & Infrastructure

### Scaling
*   **Vertical Partitioning:** Separate the "Meeting Processor" (heavy compute) from the "Dashboard/API" service. The processor should run on dedicated GPU/high-memory nodes using Kubernetes Horizontal Pod Autoscaling (HPA) based on queue depth.
*   **Data Partitioning:** As the database grows to millions of rows, implement PostgreSQL table partitioning by `OrganizationID` or `MeetingDate` to ensure query performance.

### Caching
*   **Redis Strategy:** 
    *   *Metadata Caching:* Cache user permissions and meeting tags.
    *   *Session Caching:* Store temporary AI chat history in Redis to keep the context window small and performant before persisting to the database.
    *   *Result Caching:* Use an LRU (Least Recently Used) cache for common AI queries (e.g., "What are the pending actions?") to reduce LLM costs.

### Third-Party SDK Choices
*   **Media Processing:** Use `FFmpeg` (via Python wrappers) for audio normalization and format conversion. *Note:* Ensure this is offloaded to a worker node to keep the web server responsive.
*   **LLM Orchestration:** Use `LangGraph`. It is superior to standard `LangChain` chains for meeting management because it supports cyclical logic—essential for multi-step reasoning (e.g., "Analyze transcript -> Draft MoM -> Cross-reference with existing Action Items -> Refine MoM").
*   **Telemetry:** Use `OpenTelemetry` integrated with Grafana/Prometheus to track "LLM Time to First Token" and "Transcription Latency," as these are the primary drivers of user satisfaction.
*   **Security:** Utilize `Keycloak` or a managed identity provider if the enterprise footprint grows, rather than building custom OAuth2 logic on top of the base framework.
```