# spec.md

## 1. Executive Summary & Goals
**Retail Optics** is a client-side, privacy-first computer vision dashboard. By leveraging WebGL and browser-based inference (TensorFlow.js/COCO-SSD), the system processes video data locally, removing the need for cloud-stream processing.
*   **Goal**: Provide retail management with real-time actionable insights into store traffic, safety, and security without storing or transmitting PII (Personally Identifiable Information).
*   **Performance Target**: Minimum 15 FPS on hardware with integrated GPU support via WebGL acceleration.

## 2. User Persona, Actors, and User Flows
### Actors
*   **Store Manager**: Views real-time analytics; configures operational zones.
*   **Loss Prevention Officer**: Monitors critical alerts for Asset Protection and safety incidents.
*   **System Admin**: Manages device-level model thresholds and RBAC policies.

### User Flows
1.  **Zone Configuration**: Users interact with a canvas interface to draw polygons over the video feed, assigning labels (e.g., "Checkout Zone," "High-Value Asset Zone") and defining occupancy thresholds.
2.  **Incident Alerting**: When the system detects a breach (e.g., Queue > 5 or unauthorized dwell time), a visual alert triggers on the dashboard with simultaneous logging to the local event store.

## 3. Functional Requirements

| Feature | Input | Logic Rules | Output |
| :--- | :--- | :--- | :--- |
| **Queue Analytics** | Real-time Video Stream | Count objects with 'Person' class inside defined polygon; Trigger if count > N. | Alert Banner, Time-series chart update. |
| **Fall Guardian** | Bounding Box Data | Height-to-Width ratio < 0.5 (detects horizontal orientation/body plane). | Critical Alert, Audio notification, Log entry. |
| **Asset Protection** | Bounding Box Data | Centroid tracking; Monitor object dwell time; Trigger if duration > X seconds. | Security Notification, High-priority Log entry. |
| **Heatmap** | Bounding Box Data | 2D Gaussian kernel accumulation over time mapped to frame resolution. | Canvas overlay (RGBA heatmap) with variable transparency. |

## 4. API Schema Contract Designs
*Note: These endpoints interface with a local lightweight service worker or IndexedDB wrapper to maintain the privacy-first architecture.*

**POST /api/v1/zones/configure**
*   **Headers**: `Content-Type: application/json`, `X-Auth-Token: <JWT>`
*   **Request JSON**: `{"zone_id": "lane_1", "coordinates": [[x,y],...], "type": "queue", "threshold": 5}`
*   **Response JSON**: `{"status": "success", "zone_id": "lane_1"}`

**GET /api/v1/analytics/stream**
*   **Headers**: `X-Auth-Token: <JWT>`
*   **Response JSON**: `{"timestamp": 17156789, "metrics": {"queue_count": 4, "active_incidents": 0, "zone_status": "nominal"}}`

## 5. Data Model Constraints (DDL Expectations)
```sql
-- Local Event Logs
CREATE TABLE event_logs (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50), -- 'FALL', 'QUEUE_CONGESTION', 'LINGERING'
    zone_id VARCHAR(50),
    metadata JSONB -- Stores intensity metrics, dwell duration, and confidence scores
);

-- Store Configuration and Perimeter definitions
CREATE TABLE store_config (
    zone_id VARCHAR(50) PRIMARY KEY,
    geometry GEOMETRY(POLYGON), -- Stores normalized polygon vertices
    threshold_value INT,
    zone_type VARCHAR(20)
);
```

## 6. Compliance & Security Mandates
*   **Privacy-by-Design**: Raw video frames are discarded immediately after frame inference in volatile memory. No frames are persisted to disk or cloud.
*   **Encryption**: All client-side sensitive data stored in IndexedDB must be encrypted at rest using the Web Crypto API (`SubtleCrypto` with AES-GCM).
*   **RBAC (Role-Based Access Control)**:
    *   `ADMIN`: Full CRUD permissions for `store_config` and system threshold tuning.
    *   `LP_OFFICER`: Read access to `event_logs` and critical alert streams.
    *   `VIEWER`: Read-only access to aggregate `analytics/stream` data.
*   **Transport Security**: All external telemetry or configuration updates must be strictly enforced over TLS 1.3.
*   **Client Integrity**: Implementation of a strict Content Security Policy (CSP) header to restrict script sources and prevent XSS/unauthorized code injection into the monitoring dashboard.