# research.md

## 1. Summary of Stack Constraints

The proposed architecture relies heavily on high-concurrency LLM interactions and vector-based semantic retrieval.

*   **FastAPI / Python Bottleneck:** While FastAPI is excellent for I/O-bound tasks, the CPU-intensive nature of processing long transcripts and managing concurrent AI streams requires a decoupled architecture. **Constraint:** Must utilize asynchronous workers (e.g., Celery with Redis/RabbitMQ) for transcription and LLM inference to prevent blocking the main event loop.
*   **Vector Database Choice (Qdrant):** Qdrant is well-suited for high-dimensional data but requires careful management of indexing strategies. **Constraint:** As the "Knowledge Graph" grows, index sharding and consistency during updates to embedding vectors will be critical.
*   **State Management:** The requirement for "Meeting Chat" implies high statefulness. **Constraint:** The current stateless REST API design needs to be augmented with WebSocket support for real-time interaction, as REST is inefficient for multi-turn AI conversations.

## 2. Evaluation of Integration Challenges

Integrating with third-party meeting and project management platforms presents significant operational risks:

*   **API Rate Limiting & Webhooks:** 
    *   *Gotcha:* Platforms like Jira/Slack have aggressive rate limits. Implement an exponential backoff strategy for all outbound API calls.
    *   *Edge Case:* Webhook delivery failure (e.g., Teams meeting end events not firing). **Solution:** Implement a polling-based fallback (CRON job) to verify meeting status against calendar end times.
*   **Transcript Synchronization:** 
    *   *Gotcha:* Asynchronous cloud recording availability. Zoom/Teams recordings are often not ready immediately after a meeting.
    *   *Error Handling:* Need a "Retry/Re-queue" mechanism for ingestion pipelines that fail due to late-arriving media assets.
*   **Authentication Complexity:**
    *   *Gotcha:* Maintaining separate tokens for Jira, Google, and Outlook is a security risk. **Solution:** Centralize token management using a secure vault (HashiCorp Vault or AWS Secrets Manager) and implement a robust token-refresh service.

## 3. Recommendations for Scaling, Caching, and SDKs

### Scaling Strategy
*   **Micro-services vs. Modular Monolith:** Start as a modular monolith but isolate the "Processing Layer" (Transcription/AI Extraction) as a separate service to allow horizontal scaling of GPU-intensive tasks independently of the Web/API layer.
*   **Database Partitioning:** PostgreSQL should be partitioned by `OrganizationID` or `Date` to ensure high performance for historical lookups and dashboard aggregations.

### Caching
*   **Multi-Tier Caching:**
    *   **Level 1 (Redis):** Cache AI responses (Summaries/Summaries per meeting ID) to prevent redundant calls to expensive LLM models (e.g., GPT-4o).
    *   **Level 2 (CDN):** Cache static assets and exported reports.

### Third-Party SDKs & Tools
*   **LLM Orchestration:** Use **LangGraph** (as suggested) for stateful agentic workflows, specifically for the "Action Extraction" and "Decision Register" workflows where multi-step reasoning is required.
*   **Transcription:** 
    *   *Primary:* Use Deepgram or AssemblyAI for production-grade transcription; they offer significantly higher accuracy and latency optimization compared to generic models. 
    *   *Fallback:* Use Whisper (via local/managed API) for high-privacy, sensitive meeting segments.
*   **Integration Middleware:** Utilize **Merge.dev** or **Unified.to**. These unified API platforms abstract the complexity of integrating with multiple project management (Jira, Asana, Monday) and Calendar providers, significantly reducing maintenance overhead of maintaining multiple platform SDKs.
*   **Observability:** Implement **LangSmith** alongside the suggested Prometheus/Grafana stack to debug and trace LLM "hallucinations" and latency spikes in AI chains.