# research.md

## 1. Summary of Stack Constraints

The proposed stack (FastAPI, PostgreSQL, Qdrant, React) is highly efficient for AI-native applications. However, constraints include:

*   **Asynchronous Processing:** FastAPI is ideal for I/O-bound tasks, but the heavy lifting of audio transcription and LLM inference will block the event loop if not strictly offloaded to background task queues (e.g., Celery or Dramatiq with Redis).
*   **Vector Database Management:** Qdrant is excellent, but maintaining vector consistency (embeddings) with relational data in PostgreSQL requires a robust transactional pattern or two-phase commit logic.
*   **Cold Start & Latency:** Generating AI summaries and MoMs is non-deterministic in time. The stack must account for long-polling or WebSockets to handle the asynchronous nature of AI responses.
*   **Model Vendor Lock-in:** The reliance on external APIs (Azure/OpenAI/Claude) introduces cost and latency variability. Local model hosting (via vLLM/Ollama) is currently not defined in the PRD, which limits offline processing capabilities.

## 2. Integration Challenges & Gotchas

*   **OAuth2 & SSO Diversity:** Managing multiple providers (Azure AD, Google, Okta) requires a middleware like Auth0 or Keycloak. Implementing manual integration for all providers will lead to significant maintenance debt.
*   **Meeting Platform Webhooks:** Platforms like Zoom, Teams, and Google Meet have disparate webhook schemas. 
    *   *Gotcha:* Teams/Zoom webhooks often time out or require specific server-to-server authentication headers. 
    *   *Edge Case:* Handling re-authentication when tokens for third-party calendars/integrations expire.
*   **Error State Handling:**
    *   **Rate Limits:** External AI models and Meeting APIs have strict rate limits. Implement exponential backoff and circuit breakers (Resilience4j or similar pattern) to prevent cascading failures.
    *   **Partial Failures:** If transcription completes but the summary generation fails, the system must allow manual re-triggering of the AI pipeline without re-uploading the source media.

## 3. Recommendations for Scaling & Infrastructure

### Scaling Strategy
*   **Horizontal Scalability:** Containerize the AI processing logic (Workers) separately from the API (Gateway). This allows scaling the transcription/summarization workers independently based on queue depth.
*   **Database:** Use PostgreSQL partitioning for `Transcript` and `AuditLog` tables, as these will grow exponentially.
*   **Vector Search:** Implement a two-tier RAG (Retrieval-Augmented Generation) strategy: caching common semantic search queries in Redis before hitting the Qdrant instance.

### Caching
*   **Embedding Cache:** Cache embeddings for static documents to save on LLM token costs.
*   **Meeting Result Cache:** Cache the "Meeting Summary" and "Action List" objects in Redis; they are read-heavy but updated infrequently once generated.

### Third-Party SDK & Tooling Choices
*   **Transcription:** Avoid building custom models. Use **Deepgram** (industry-leading speed/accuracy) or **OpenAI Whisper (API)**. Deepgram supports real-time streaming, which is superior for "Live Meeting Assistant" requirements.
*   **Auth:** **Keycloak** or **Clerk** to abstract the complexity of multiple OIDC/OAuth2 providers.
*   **Task Queue:** **Celery** with **Redis** for managing the long-running AI pipeline.
*   **Orchestration:** **LangGraph** is a strong choice here to manage the "Meeting-to-Action" state transitions—allowing the AI to reason through multiple steps (e.g., identify task -> verify owner -> check conflict).
*   **Monitoring:** Use **LangSmith** for observability into the LLM chains; it is essential for debugging non-deterministic AI outputs in a production environment.