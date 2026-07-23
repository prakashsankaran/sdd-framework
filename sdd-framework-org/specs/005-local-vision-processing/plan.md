# plan.md

## 1. Architecture Summary
**Retail Optics** follows a "Local-First" architecture. The stack consists of a React/TypeScript frontend hosting the `TensorFlow.js` runtime, a Web Worker for off-main-thread inference to maintain UI responsiveness, and a local `IndexedDB` instance acting as the data persistence layer. Security is enforced via `SubtleCrypto` at the storage layer and a restrictive `CSP` header.

## 2. Component Structure
```text
/src
  /assets/models      # COCO-SSD weight files
  /components
    /Dashboard        # Real-time charts/metrics
    /ZoneCanvas       # Polygon drawing tool (Fabric.js/Konva)
    /AlertSystem      # Notification triggers
  /core
    /inference.worker # WebWorker for TF.js/COCO-SSD loop
    /crypto.ts        # AES-GCM encryption/decryption logic
    /db.ts            # Dexie.js wrapper for IndexedDB
  /hooks
    /useVideoFeed.ts  # MediaDevices access
  /api                # Mocked local service worker intercepts
```

## 3. Phased Implementation Schedule

### Phase 1: Core Engine & Privacy (Weeks 1-2)
*   Setup React/TypeScript environment with `TensorFlow.js`.
*   Implement `WebWorker` for non-blocking frame inference.
*   Setup `SubtleCrypto` utility for data encryption at rest.
*   Implement `IndexedDB` schema using `Dexie.js`.

### Phase 2: Analytics & Geometry (Weeks 3-4)
*   Integrate `Canvas API` for the Zone Configuration tool (Polygon drawing).
*   Develop spatial algorithms (Point-in-Polygon check) for "Queue Analytics."
*   Implement "Fall Guardian" ratio-based logic and "Asset Protection" centroid-tracking.

### Phase 3: Reporting & Compliance (Weeks 5-6)
*   Implement Time-series charts (`Chart.js` or `Recharts`) for the dashboard.
*   Integrate `CSP` headers via build-time configuration.
*   Build the Role-Based Access Control (RBAC) middleware for the local API service.

## 4. Verification Plan

### Automated Scripts
*   **Unit Tests (`Vitest`)**: Validate geometry logic (e.g., test point-in-polygon calculations with boundary cases).
*   **Encryption Tests**: Verify that `Dexie.js` data is unreadable when accessed outside the app’s encryption context.
*   **Performance Benchmarking**: Automated script to log frame latency; fail build if inference time exceeds 66ms (15 FPS).

### Manual Test Flows
*   **Privacy Audit**: Use Chrome DevTools Network tab to confirm 0 outbound requests for image/video binary data.
*   **Zone Configuration**: Verify that drawing a polygon correctly masks inference to only events within the zone.
*   **Security Breach**: Attempt to inject a malicious script via console to verify CSP blocking.
*   **Fall Detection**: Use pre-recorded video samples of a person falling to verify the 0.5 ratio threshold trigger.

### Test Routes (Mocked endpoints)
*   `GET /api/v1/analytics/stream`: Verify JSON schema returns current `queue_count` and `active_incidents` every 1s.
*   `POST /api/v1/zones/configure`: Verify polygon coordinates are stored in the `store_config` table and persist after browser refresh.