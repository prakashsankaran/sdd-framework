# spec.md

## 1. Executive Summary & Goals
**Retail Optics** is a client-side, privacy-first computer vision (CV) dashboard designed for retail operational intelligence. 

**Core Goals:**
*   **Zero-Latency Privacy**: Process all video data locally using TensorFlow.js (WebGL backend); no raw video transmission to servers.
*   **Operational Efficiency**: Reduce checkout wait times through automated congestion alerts.
*   **Safety & Loss Prevention**: Minimize liability via automated fall detection and secure high-value assets via dwell-time tracking.
*   **Actionable Insights**: Aggregate spatial data into visual density heatmaps for store layout optimization.

---

## 2. User Persona, Actors, and User Flows

### Personas
*   **Store Manager**: Uses the dashboard to monitor real-time queue lengths and floor safety.
*   **Loss Prevention Specialist**: Configures "High-Value Zones" and reviews dwell-time alerts.
*   **Corporate Analyst**: Reviews aggregate heatmaps for store traffic optimization.

### User Flows
1.  **Calibration**: User selects camera stream -> defines zones (ROI) -> assigns zone types (Queue vs. Asset).
2.  **Monitoring**: Real-time rendering of bounding boxes + alert notification trigger.
3.  **Reporting**: Export aggregate spatial data logs to the centralized analytics API.

---

## 3. Functional Requirements

| Feature | Input | Logic Gate | Output |
| :--- | :--- | :--- | :--- |
| **Queue Analytics** | Camera feed (Tensor) | `count(objects.person) > threshold` | Visual alert + Alert Event |
| **Fall Guardian** | Bounding box (x,y,w,h) | `h/w ratio > 2.0` for > 3 seconds | Immediate UI/Audio alarm |
| **Asset Protection** | Centroid coordinates | `if centroid inside ROI && time > threshold` | Suspicious lingering alert |
| **Heatmap** | Cumulative frame centroids | Apply 2D Gaussian Kernel filter | Canvas overlay opacity map |

---

## 4. API Schema Contract (Telemetry/Sync)

*Note: Data egress is limited to processed telemetry only; no video streams are transmitted.*

**Endpoint**: `POST /api/v1/telemetry/sync`
**Headers**: `Authorization: Bearer <JWT>`, `Content-Type: application/json`

**Request JSON**:
```json
{
  "store_id": "LOC-882",
  "timestamp": "2023-10-27T10:00:00Z",
  "events": [
    {"type": "QUEUE_ALERT", "count": 12, "lane_id": "L-01"},
    {"type": "DWELL_ALERT", "asset_id": "A-99", "duration_sec": 45}
  ]
}
```

**Response JSON**:
```json
{
  "status": "success",
  "sync_id": "uuid-v4",
  "received_at": "2023-10-27T10:00:01Z"
}
```

---

## 5. Data Model Constraints (DDL Expectations)

```sql
CREATE TABLE operational_logs (
    event_id UUID PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(20), -- 'FALL', 'QUEUE', 'DWELL'
    severity INT CHECK (severity BETWEEN 1 AND 5),
    metadata JSONB, -- Stores bounding box, zone coordinates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Compliance & Security Mandates

*   **Privacy-by-Design**: The application must not persist raw frame data. All detection must be performed in volatile memory.
*   **Role-Based Access Control (RBAC)**:
    *   *Viewer*: Read-only dashboard access.
    *   *Manager*: Edit ROI boundaries and threshold configurations.
    *   *Admin*: System configuration and log export.
*   **Security Protocols**:
    *   **TLS 1.3**: Mandatory for all outbound API communication.
    *   **Data Encryption**: Local storage of thresholds/configurations must be encrypted via Web Crypto API.
    *   **Content Security Policy (CSP)**: Must forbid external script execution (no third-party tracking scripts allowed).