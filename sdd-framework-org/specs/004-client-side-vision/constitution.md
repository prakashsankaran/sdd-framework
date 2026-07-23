```markdown
# constitution.md

## 1. High-Level Principles
*   **Privacy-First Execution**: All computer vision processing occurs strictly on the client-side. No raw video streams shall ever be transmitted to or stored on a server.
*   **User-Centric Performance**: The interface must prioritize low-latency feedback. UI responsiveness takes precedence over complex visual data rendering.
*   **Secure-by-Default**: Every component is built with the assumption of untrusted environments. Data minimization is strictly enforced; only anonymized metadata (counts, timestamps) is persisted.
*   **Edge-Ready Architecture**: The application must remain functional in intermittent network conditions, utilizing the browser as the primary computation engine.

## 2. Tech Stack Guidelines
*   **Frontend**: 
    *   Framework: React with Vite for high-performance builds.
    *   Styling: Tailwind CSS for maintainable, utility-first design.
    *   Vision Engine: TensorFlow.js (COCO-SSD) utilizing WebGL/WebGPU acceleration.
*   **Backend (Data Orchestration)**:
    *   Runtime: Node.js with Express for lightweight API handling and state synchronization.
    *   Database: PostgreSQL for reliable, relational storage of analytical logs and configuration metadata.
*   **Inter-process Communication**:
    *   Frontend/Backend: RESTful APIs for metadata synchronization; WebSockets for real-time alert broadcasting.

## 3. Architectural Boundaries and Rules
*   **Processing Isolation**: The Computer Vision pipeline (tracking, centroid calculation, heatmap generation) must exist solely within the Browser's execution context. 
*   **Non-Blocking Logic**: Heavy analytical tasks (e.g., Gaussian kernel rendering) must be offloaded to Web Workers to prevent UI thread jank.
*   **Backend Restrictions**:
    *   The backend is strictly prohibited from receiving raw video feeds, binary image blobs, or frame data.
    *   The backend shall only ingest processed telemetry: (e.g., `event_type`, `timestamp`, `confidence_score`, `zone_id`).
*   **Data Integrity**: Spatial analytics must be resilient to jitter. All centroid association and tracking algorithms must implement frame-buffer smoothing to ensure stability in detected object paths.
*   **Deployment**: The application must be deployable as a containerized stack where the client-side bundle is served via a lightweight Nginx proxy, and the PostgreSQL/Node backend manages only the persistent analytical ledger.
```