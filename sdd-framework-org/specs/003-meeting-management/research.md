# research.md

## 1. Summary of Stack Constraints

The proposed stack (FastAPI, PostgreSQL, Qdrant, React) is highly efficient for AI-first applications, but introduces specific constraints:

*   **Asynchronous Processing:** FastAPI is ideal for I/O-bound tasks, but the heavy lifting of audio transcription and LLM inference must be strictly offloaded to a task queue (e.g., Celery/RabbitMQ or Temporal). Synchronous processing will block the event loop and timeout client requests.
*   **Vector Database Dynamics:** Qdrant is optimized for high-dimensional data. Constraints exist around indexing speed for massive, real-time meeting ingestion vs. query latency. TTL (Time-to-Live) management for embeddings is required to prevent storage bloat.
*   **State Management:** With React and TypeScript, handling real-time "AI Copilot" streams requires robust WebSocket management and efficient hydration of transient state vs. persistent RAG (Retrieval-Augmented Generation) memory.
*   **Cost Management:** Relying on Azure OpenAI/Claude/Gemini creates a variable OpEx model. The architecture must support model swapping (via an abstraction layer) to mitigate vendor lock-in and cost spikes.

## 2. Evaluation of Integration Challenges

Integrating with third-party platforms (Zoom, Teams, Jira) involves significant "gotchas":

*   **OAuth Scopes & Token Expiry:**
    *   *Challenge:* Refresh token rotation across diverse providers (Teams, Google, Slack).
    *   *Handling:* Implement a centralized OAuth proxy service to manage token lifecycle and handle 401/403 errors gracefully via background silent refresh.
*   **API Rate Limiting:**
    *   *Challenge:* Aggressive polling for meeting status or action synchronization can hit provider API limits (especially Jira/DevOps).
    *   *Handling:* Implement an exponential backoff strategy and a request-throttling middleware. Use Webhooks (e.g., Teams/Slack webhooks) rather than polling where possible.
*   **Meeting Recording Access:**
    *   *Challenge:* Accessing "cloud recordings" often requires deep administrative permissions (Service Accounts) which are often restricted by enterprise IT policies.
    *   *Handling:* Support multiple ingestion methods: direct API integration, file uploads, and a "bot-in-the-room" listener model.
*   **Error State Handling:**
    *   *Challenge:* Partial failures (e.g., meeting records but transcription fails).
    *   *Handling:* Use idempotent job processing. If a transcript fails, expose a UI trigger for manual re-processing/re-upload without losing meeting metadata.

## 3. Recommendations

### Scaling
*   **Horizontal Autoscaling:** Deploy the API layer and the worker pool in separate K8s namespaces. The worker pool (transcription/AI) should scale based on queue depth (KEDA - Kubernetes Event-Driven Autoscaling) rather than CPU/RAM.
*   **Database Sharding/Partitioning:** Use PostgreSQL partitioning for `AuditLogs` and `Transcript` tables, as these will grow linearly with every meeting.

### Caching Strategy
*   **Multi-Tier Caching:**
    *   *L1 (Redis):* Cache frequently accessed meeting summaries and dashboard aggregations (TTL: 1 hour).
    *   *L2 (Vector):* Semantic search results should be cached using the semantic query as a key to avoid repeated LLM/Vector compute costs.
    *   *L3 (CDN):* Serve static frontend assets and cached media files via a CDN (e.g., Cloudflare/CloudFront).

### Third-Party SDK & Tooling Choices
*   **Audio/Transcription:** Do not reinvent transcription. Use **Deepgram** or **AssemblyAI** for real-time streaming transcription (lower latency than OpenAI Whisper).
*   **Orchestration:** Use **LangGraph** (as suggested) for managing the "AI Copilot" state machines; it is superior to standard LangChain for maintaining long-running conversation history.
*   **Integration Middleware:** Consider **Merge.dev** or **Unified.to**. These platforms provide a single API interface for multiple integrations (Jira, Slack, Teams), reducing the maintenance burden of dozens of individual SDKs and auth flows.
*   **Observability:** Implement **LangSmith** for tracing AI chains, prompt versioning, and latency monitoring. It is essential for identifying which part of the "RAG pipeline" is causing slow responses.