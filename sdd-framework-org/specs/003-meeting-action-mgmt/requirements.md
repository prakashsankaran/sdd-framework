Reconstructed Requirements based on active specification documentation:

### Constitution Principles:
# constitution.md

## 1. Project Philosophy & Core Principles
This platform is built upon a foundation of operational excellence and user-centric design. All development decisions must align with these pillars:

*   **User-First Workflow:** Every interaction must minimize friction. If an AI task takes more than two clicks or requires complex input, the UX design is failing.
*   **Secure-by-Default:** Data privacy is paramount. PII and enterprise secrets are encrypted at rest and in transit. Access controls (RBAC) are enforced at the API layer, never just the UI.
*   **AI-Augmented, Human-Controlled:** The platform acts as a co-pilot. All AI-generated outputs (MoM, action items) must be reviewable and editable by human users to maintain institutional trust.
*   **Scalable & Resilient:** Systems must be designed for horizontal scalability. With a target of 100,000 concurrent users, all processing (especially transcription and summarization) must be offloaded to asynchronous background wo

### Specification Goals:
# spec.md

## 1. Executive Summary & Goals
The **Intelligent Meeting & Action Management Platform** is an enterprise-grade solution designed to automate the lifecycle of professional meetings. By leveraging Generative AI and RAG (Retrieval-Augmented Generation), the platform aims to eliminate manual documentation overhead by 90% and centralize organizational decision-making.

**Primary Goals:**
*   **Automation:** End-to-end transcription, summarization, and action item extraction.
*   **Intelligence:** Semantic search across organizational history and AI-driven predictive insights.
*   **Accountability:** Real-time action tracking with integration into existing project management tools (Jira, DevOps).
*   **Scalability:** High-availability architecture supporting 100,000+ concurrent users.

---

## 2. User Personas, Actors, and User Flows

### Personas
*   **Individual Contributor:** Focused on personal productivity and task management.
*   **Project Manager:** Focused on team velocit