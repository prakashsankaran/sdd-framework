# JIRA Backlog Export

| Summary | Description | Issue Type | Priority | Story Points | Labels |
| --- | --- | --- | --- | --- | --- |
| JIRA-001: Implement OAuth2/OIDC SSO Integration | Configure authentication service to support OIDC/SAML for enterprise login, ensuring mandatory SSO for all users and enforcing MFA for Admin/PM roles as per compliance mandates. | Story | High | 8 | Security, Auth |
| JIRA-002: Build Meeting Ingestion Service | Develop background worker to sync with Outlook/Google Calendar APIs, retrieve meeting participant lists, and trigger the processing pipeline upon meeting completion. | Story | High | 5 | Integration, Backend |
| JIRA-003: AI Pipeline - Transcription & Speaker Diarization | Integrate Whisper/Deepgram ASR model to process raw audio streams, outputting timestamped text segments mapped to unique Speaker IDs. | Story | High | 13 | AI, Core |
| JIRA-004: Implement Action Item Extraction Engine | Develop an NLP service utilizing NER and intent classification to parse meeting transcripts into structured JSON (Owner, Due Date, Task) for storage in the ActionItems table. | Story | High | 8 | AI, Backend |
| JIRA-005: Setup Vector Database for Semantic Search | Deploy and configure Qdrant to store meeting embeddings (1536-dim). Implement search API to enable natural language querying across meeting history. | Task | Medium | 5 | Infrastructure, Search |
| JIRA-006: RBAC Policy Enforcement Middleware | Create an API gateway middleware that validates user roles (ADMIN, EXEC, PM, EMPLOYEE) and filters meeting visibility based on participant/invitee status. | Task | High | 5 | Security, API |
| JIRA-007: Risk Detection Analytics Module | Implement pattern matching and sentiment analysis to identify 'High/Med/Low' risks within transcripts and surface them in the Executive dashboard. | Story | Medium | 5 | Analytics, AI |
| JIRA-008: Fix - Audit Logging Latency | Optimize the AuditLog write operations to ensure non-blocking logging for high-traffic AI query endpoints to prevent API timeout. | Bug | Medium | 3 | Performance, Compliance |
