# constitution.md

## 1. Core Principles
*   **Privacy-First Design**: All computer vision processing occurs strictly on the client-side. No video data or identifiable imagery shall be transmitted to external servers.
*   **Performance at the Edge**: Minimize reliance on centralized compute. Leverage hardware acceleration (WebGL/WebGPU) to maintain high frame rates while keeping the browser responsive.
*   **Security-by-Default**: Every component must assume a hostile network environment. All API interactions must be encrypted, authenticated, and rate-limited.
*   **Resilience & Reliability**: Systems must gracefully degrade if hardware resources are constrained. User experience must remain fluid regardless of processing load.

## 2. Tech Stack Guidelines
*   **Frontend**: 
    *   Framework: React with Vite for high-performance builds.
    *   Styling: Tailwind CSS for responsive, utility-first UI.
    *   State Management: Zustand or React Context for managing real-time analytics streams.
    *   Vision Engine: TensorFlow.js (COCO-SSD) utilizing WebGL/WebGPU acceleration.
*   **Backend (API & Coordination)**:
    *   Runtime: Node.js with Express.js.
    *   Responsibility: Handles metadata storage, historical analytics reporting, and alert routing. No raw video processing allowed here.
*   **Persistence**:
    *   Database: PostgreSQL for relational data, including user settings, event logs, and structured analytics snapshots.

## 3. Architectural Boundaries & Rules

### Data Flow & Privacy Rules
*   **Zero-Persistence Policy**: Raw video feeds are transient. Memory buffers must be cleared between frames to prevent memory leaks and ensure PII (Personally Identifiable Information) does not persist beyond the inference lifecycle.
*   **Server-Side Restrictions**: The backend is strictly forbidden from processing raw video frames. It shall only ingest processed telemetry (e.g., "Queue count: 5," "Alert: Fall detected").

### System Constraints
*   **Inference Latency**: The application must target a minimum of 15 FPS for inference; any implementation that causes UI thread blocking must be refactored into a Web Worker.
*   **Modularity**: Each core capability (Queue Analytics, Fall Guardian, Asset Protection, Heatmaps) must be implemented as an independent service/module within the frontend to allow for granular resource management.
*   **State Integrity**: All client-side analytics generated for the heatmap must be periodically flushed to the PostgreSQL backend to ensure persistent reporting, while keeping the client-side memory footprint within acceptable bounds.

### Security
*   **API Security**: All communication between the client dashboard and the Node/Express server must use HTTPS with JWT-based authentication.
*   **Input Validation**: Strict schema validation (using Zod or Joi) must be applied to all telemetry data arriving at the API to prevent database injection or malformed analytics payloads.