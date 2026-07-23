# spec.md

## 1. Executive Summary & Goals
**Retail Optics** is a client-side, privacy-first computer vision dashboard. By leveraging WebGL and browser-based inference (TensorFlow.js/COCO-SSD), the system processes video data locally, ensuring PII (Personally Identifiable Information) never leaves the edge device.

**Goals:**
*   Eliminate cloud latency for real-time operational alerting.
*   Provide actionable retail insights (queue length, safety, loss prevention) with zero external dependency.
*   Maintain 100% data residency on the client device.

## 2. User Persona, Actors, and User Flows

### Persona
*   **Store Operations Manager (SOM)**: Needs real-time alerts on dashboard and end-of-day reports.
*   **Loss Prevention Officer (LPO)**: Needs to track dwell times in high-value zones.

### User Flows
1.  **Configuration**: User grants camera permissions -> Loads model -> Defines spatial zones (Heatmap/Asset Protection) -> Initiates stream.
2.  **Detection & Alerting**: System detects object -> Logic gate evaluates event -> UI triggers visual/audible alert.
3.  **Analytics Export**: User requests historical data -> System exports cached local state to JSON/CSV.

## 3. Functional Requirements

| Feature | Input | Logic | Output |
| :--- | :--- | :--- | :--- |
| **Queue Analytics** | Person class count | If count > threshold > duration > Xs | UI Alert / Log |
| **Fall Guardian** | Bounding Box (H > W) | If aspect ratio inverts (y-axis change) | Emergency Alert |
| **Asset Protection** | Centroid coordinates | If centroid enters zone AND timer > dwell limit | Suspicious Activity Log |
| **Heatmaps** | Centroid series | 2D Gaussian accumulation per frame | Spatial Density Layer |

## 4. API Schema Contract (Mock/Local-Bridge)
*Note: Since this is client-side, APIs act as internal messaging between the CV-engine and the UI-controller.*

### POST `/api/v1/alert`
*   **Headers**: `Content-Type: application/json`
*   **Request JSON**:
    ```json
    { "type": "FALL_DETECTION", "timestamp": "ISO-8601", "confidence": 0.92, "zone_id": "lane_01" }
    ```
*   **Response JSON**:
    ```json
    { "status": "acknowledged", "alert_id": "uuid-1234" }
    ```

## 5. Data Model Constraints (DDL Expectations)
The application uses IndexedDB for local storage.

```sql
-- Conceptual Schema
CREATE TABLE analytics_logs (
    id UUID PRIMARY KEY,
    event_type VARCHAR(50), -- QUEUE, FALL, DWELL
    zone_id VARCHAR(20),
    timestamp TIMESTAMP,
    metadata JSONB -- Stores bounding box history
);

CREATE TABLE app_config (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value JSONB -- Thresholds, Zone definitions
);
```

## 6. Compliance & Security Mandates

### Security Measures
1.  **Zero-Network Policy**: The system is designed to operate in an air-gapped environment. Network requests are restricted to local loopback if external syncing is required.
2.  **Memory Management**: All frame data is cleared from the GPU buffer at the end of every animation frame to prevent memory-based forensic recovery.
3.  **Authentication**: Role-Based Access Control (RBAC) implemented via Web Crypto API (SHA-256 for local PIN verification).

### Compliance
*   **Privacy-by-Design**: No raw video frames are saved to disk. Only derived telemetry (metadata) is persisted.
*   **TLS**: All remote communication (if enabled for enterprise logging) must be enforced via TLS 1.3.
*   **Consent**: The dashboard requires an active "Privacy Mode" toggle for employee awareness prior to camera initialization.