# spec.md

## 1. Executive Summary & Goals
**Retail Optics** is a client-side, privacy-first computer vision dashboard. By leveraging WebGL and browser-based inference (TensorFlow.js/COCO-SSD), the system processes video data locally, removing the need for cloud-stream processing.
*   **Goal**: Provide retail management with real-time actionable insights into store traffic, safety, and security without storing or transmitting PII (Personally Identifiable Information).
*   **Performance Target**: Minimum 15 FPS on hardware with integrated GPU support.

## 2. User Persona, Actors, and User Flows
### Actors
*   **Store Manager**: Views real-time analytics; configures zones.
*   **Loss Prevention Officer**: Receives alerts for Asset Protection incidents.
*   **System Admin**: Manages device-level settings and model thresholds.

### User Flows
1.  **Zone Configuration**: User draws polygons over a video feed to define "Checkout Zones" or "High-Value Asset Zones."
2.  **Alerting**: System detects threshold breach (Queue > 5) -> Trigger visual alert on dashboard -> Log event locally.

## 3. Functional Requirements
| Feature | Input | Logic | Output |
| :--- | :--- | :--- | :--- |
| **Queue Analytics** | Video Feed | Count 'Person' class in polygon; Threshold: > N occupants. | Alert Banner, Time-series chart update. |
| **Fall Guardian** | Bounding Box | Height:Width ratio < 0.5 (Horizontal orientation). | Critical Alert, Audio notification. |
| **Asset Protection** | Bounding Box | Centroid-association; Dwell time > X seconds. | Security Notification, Log entry. |
| **Heatmap** | Bounding Box | 2D Gaussian kernel accumulation over time. | Canvas overlay (RGBA). |

## 4. API Schema Contract Designs
*Note: As a client-side tool, these endpoints interface with local browser-storage or a local lightweight service worker.*

**POST /api/v1/zones/configure**
*   **Headers**: `Content-Type: application/json`, `X-Auth-Token: <JWT>`
*   **Request JSON**: `{"zone_id": "lane_1", "coordinates": [[x,y],...], "type": "queue"}`
*   **Response JSON**: `{"status": "success", "zone_id": "lane_1"}`

**GET /api/v1/analytics/stream**
*   **Response JSON**: `{"timestamp": 17156789, "metrics": {"queue_count": 4, "active_incidents": 0}}`

## 5. Data Model Constraints (DDL Expectations)
```sql
CREATE TABLE event_logs (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50), -- 'FALL', 'QUEUE_CONGESTION', 'LINGERING'
    zone_id VARCHAR(50),
    metadata JSONB -- Stores intensity, duration, etc.
);

CREATE TABLE store_config (
    zone_id VARCHAR(50) PRIMARY KEY,
    geometry GEOMETRY(POLYGON),
    threshold_value INT
);
```

## 6. Compliance & Security Mandates
*   **Privacy-by-Design**: Raw video frames are discarded immediately after frame inference. No frames are stored in long-term databases.
*   **Encryption**: All local browser storage (IndexedDB) must be encrypted using `SubtleCrypto` (AES-GCM).
*   **RBAC**: 
    *   `ADMIN`: Full read/write to `store_config`.
    *   `VIEWER`: Read-only access to `analytics/stream`.
*   **Transport**: Any external telemetry must be sent over TLS 1.3 only. 
*   **Client Integrity**: Implementation of Content Security Policy (CSP) to prevent unauthorized script injection into the monitoring dashboard.