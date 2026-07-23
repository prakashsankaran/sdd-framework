# constitution.md

## 1. Core Principles
*   **Privacy-First Architecture**: All visual data processing must occur strictly on the client-side. No raw video or image frames are to be transmitted to any server.
*   **Performance Optimized**: Compute-heavy tasks must be offloaded to the client’s GPU via WebGL. The UI must remain responsive at 30+ FPS during active inference.
*   **Security-by-Design**: Authentication and data integrity are non-negotiable. Even as a local-first application, all communication with the backend must be encrypted and authorized.
*   **Resilient Modularity**: Each analytics module (Queue, Fall, Asset, Heatmap) must be decoupled to allow independent scaling and lifecycle management.

## 2. Technology Stack Guidelines
*   **Frontend**: React (latest) with Vite for high-performance builds. Styling must be strictly managed via Tailwind CSS.
*   **Inference Engine**: TensorFlow.js (COCO-SSD) utilizing WebGL backend for hardware acceleration.
*   **Backend (Operations/Metadata)**: Node.js with Express. The backend serves strictly as a telemetry sink and configuration management layer—never for video processing.
*   **Database**: PostgreSQL for storing structured analytical telemetry, metadata, and persistent configuration. No blob storage of visual data.

## 3. Architectural Boundaries and Rules
*   **Zero-Persistence Policy**: Raw video data is strictly volatile. It must exist only in memory (WebRTC/MediaStream objects) and be immediately discarded after inference. 
*   **Backend Constraint**: The backend is prohibited from receiving raw video streams. Only scalar telemetry (e.g., "count: 5", "alert_type: fall", "timestamp: X") may be transmitted.
*   **Client-Side Sovereignty**: The frontend must remain functional in "Offline Mode." If the connection to the backend fails, local analytics must continue, with data queued for later synchronization.
*   **CPU/GPU Budgeting**: Inference loops must implement throttling mechanisms to ensure the host system’s stability. If frames exceed a processing latency threshold, the engine must switch to frame-skipping mode.
*   **State Management**: Complex application state (video processing status, zone configurations) must be managed using state-management patterns that prevent unnecessary re-renders during high-frequency object detection updates.