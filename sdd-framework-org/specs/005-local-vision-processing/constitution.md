# constitution.md

## 1. Core Principles
*   **Privacy-First Integrity**: No raw video data shall be persisted. The system processes streams in volatile memory, ensuring PII is never stored, transmitted, or logged.
*   **Secure-by-Default**: Every component—from the client-side `SubtleCrypto` storage to the API transport layer—must default to encrypted-at-rest and encrypted-in-transit states.
*   **Performance-Centric**: Compute operations must remain lightweight. If inference overhead exceeds the 15 FPS threshold on integrated hardware, feature-toggling or model-quantization must be prioritized over new feature implementation.
*   **Local Sovereignty**: The system is designed to operate autonomously. Critical alerting and monitoring functionality must remain operational even in the event of an external network failure.

## 2. Technical Stack Guidelines
*   **Frontend**: React 18+ with Vite for rapid HMR and build optimization. Tailwind CSS shall be used for all UI components to ensure a consistent, responsive design language.
*   **API & Middleware**: Node.js with Express.js for the lightweight local service worker/server. Logic should be kept thin, delegating heavy calculations to browser-based TensorFlow.js kernels.
*   **Database**: PostgreSQL for structured data and configuration. Use `JSONB` for event metadata to maintain schema flexibility while ensuring ACID compliance for critical system logs.
*   **Inference Engine**: TensorFlow.js utilizing the COCO-SSD model. Use WebGL backends preferentially; fallback to CPU must be strictly throttled to prevent UI blocking.

## 3. Architectural Boundaries
*   **Isolation of Concerns**:
    *   **Inference Layer**: Restricted to the browser main thread or dedicated Web Workers. Direct access to DOM or external APIs is prohibited for the inference loop.
    *   **Management Layer**: Controlled by the React/Express bridge. Only validated configurations shall be written to the database.
*   **Data Integrity Rules**:
    *   Raw video data is **volatile memory only**.
    *   Persistent logs (`event_logs`) are strictly limited to incident metadata (counts, types, durations).
*   **Security Constraints**:
    *   **CSP Enforcement**: A strict Content Security Policy must prohibit `unsafe-inline` scripts and restrict `connect-src` to validated local/internal endpoints.
    *   **RBAC Enforcement**: The API layer must strictly validate the `X-Auth-Token` against JWT claims before allowing any interaction with the `store_config` table.
    *   **Encryption**: All client-side persisted configurations (IndexedDB) must be protected using `AES-GCM` via the `Web Crypto API`.

## 4. Operational Guardrails
*   **Modularity**: Any new visual features (e.g., new analytics widgets) must be developed as modular Canvas components to avoid impacting the main rendering thread of the video feed.
*   **Documentation**: All new API endpoints or data schema changes require corresponding updates to the API Schema Contract and DDL definitions.
*   **Compliance Verification**: Quarterly audits of the `event_logs` table are mandatory to ensure no inadvertent leakage of metadata that could be reconstituted into PII.