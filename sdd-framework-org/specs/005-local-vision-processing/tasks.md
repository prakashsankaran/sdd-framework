# tasks.md

## 1. Setup & Environment
- [ ] Initialize Project Environment: Setup Webpack/Vite, TypeScript, and install TensorFlow.js (COCO-SSD).
- [ ] Security Baseline: Implement Content Security Policy (CSP) headers and set up `SubtleCrypto` wrapper for IndexedDB encryption.
- [ ] Data Layer Setup: Initialize local IndexedDB storage with encryption middleware.

## 2. Backend / Local Persistence
- [ ] Schema Implementation: Define and initialize IndexedDB stores matching the `event_logs` and `store_config` DDL structure.
- [ ] Storage Utility: Create service worker or utility class for local read/write operations with AES-GCM encryption.

## 3. Backend APIs (Local Service Worker/Mock)
- [ ] Configure Endpoints: Implement `POST /api/v1/zones/configure` for polygon storage.
- [ ] Analytics Stream: Implement `GET /api/v1/analytics/stream` to aggregate and return real-time metrics from the inference engine.
- [ ] RBAC Logic: Develop JWT-based authentication middleware to enforce `ADMIN` vs `VIEWER` access levels.

## 4. Frontend Components
- [ ] Video Engine: Implement camera capture and TensorFlow.js inference loop (aiming for 15 FPS).
- [ ] Geometry Drawer: Create a Canvas component for users to draw and save polygons.
- [ ] Alerting System: Build a notification component for Fall, Queue, and Asset Protection triggers.
- [ ] Visualizers:
  - [ ] Implement Time-series chart for Queue Analytics.
  - [ ] Implement RGBA Heatmap overlay using Gaussian kernel logic.

## 5. Frontend Pages
- [ ] Dashboard Page: Primary view for real-time analytics streaming and alert display.
- [ ] Configuration Page: Interface for Zone management (Polygon creation/editing).
- [ ] Logs/Alerts Page: Display for historical `event_logs` data.

## 6. Integration & QA
- [ ] Performance Profiling: Benchmark inference speed on integrated GPUs; optimize frame processing pipeline.
- [ ] Security Audit: Validate that no video frames are persisted in storage and that IndexedDB is correctly encrypted.
- [ ] Functional Testing: 
  - [ ] Verify polygon threshold breach triggers alerts.
  - [ ] Verify RBAC restrictions prevent Unauthorized config changes.
- [ ] Deployment Readiness: Finalize TLS 1.3 requirements and environment variable lockdown.