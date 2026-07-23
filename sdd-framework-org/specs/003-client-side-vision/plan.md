```markdown
# plan.md

## 1. Summary of Architecture
**Retail Optics** follows a "Client-Side Intelligence" architecture. The application leverages the browser’s hardware acceleration capabilities to process video feeds locally.

*   **Runtime:** Browser-based execution using TensorFlow.js (TF.js).
*   **Vision Engine:** COCO-SSD model (MobileNetV2 base) optimized via WebGL backend.
*   **Data Pipeline:** Video frames are captured via `MediaDevices.getUserMedia()`, piped into an `OffscreenCanvas` for analysis, and visualized via an overlay `<canvas>` layer.
*   **State Management:** An in-memory analytics engine processes detection tensors to compute metrics (Queue length, dwell time, fall events) without persistence to a remote server.

## 2. Components, Directories, and Files
```text
/retail-optics
├── /src
│   ├── /engine
│   │   ├── model.loader.js    # TF.js initialization & COCO-SSD loading
│   │   ├── vision.processor.js # Frame analysis & tensor manipulation
│   │   └── analytics.js       # Logic for queue, fall, and dwell math
│   ├── /components
│   │   ├── VideoOverlay.js    # Canvas rendering for bounding boxes/heatmaps
│   │   └── Dashboard.js       # UI for metrics display
│   ├── /utils
│   │   ├── gaussian.js        # Heatmap density kernel calculation
│   │   └── geometry.js        # Centroid association & aspect ratio logic
│   └── index.js               # App entry point
├── /public
│   └── models/                # Static assets for model weights
└── package.json
```

## 3. Phased Implementation Schedule

### Phase 1: Core Vision Pipeline (Days 1-3)
*   Setup TF.js environment with WebGL backend.
*   Implement `getUserMedia` stream capture to canvas.
*   Integrate COCO-SSD and verify object detection on a live webcam feed.

### Phase 2: Analytics Logic (Days 4-7)
*   **Queue Analytics:** Implement object count for 'person' class in defined regions.
*   **Fall Guardian:** Develop bounding box aspect-ratio filter (H > W threshold).
*   **Asset Protection:** Implement centroid tracking (Kalman filter or simple Euclidean distance matching) to calculate dwell time in virtual zones.

### Phase 3: Visualization & Heatmapping (Days 8-10)
*   Develop 2D Gaussian kernel utility for heatmap accumulation.
*   Build UI dashboard to render analytics overlays in real-time.
*   Optimize render loop to prevent main-thread jank.

## 4. Verification Plan

### Automated Scripts
*   **Unit Tests:** Jest tests for `geometry.js` to ensure coordinate transforms are correct.
*   **Model Accuracy Check:** Run a suite of static images with known bounding boxes to verify detection thresholds (`test/vision.spec.js`).

### Test Routes
*   **Synthetic Feed:** Provide a video file URL (simulated stream) to ensure the analytics logic remains deterministic.
*   **Performance Profiling:** Monitor FPS drop during continuous processing to ensure it stays >20fps on target hardware.

### Manual Validation Flows
*   **Queue Validation:** Physically stand in front of the camera and verify "Queue Count" updates within <500ms.
*   **Fall Detection:** Execute a controlled, safe slip-and-fall (or drop a prone cardboard cutout) to verify "Fall Guardian" event firing.
*   **Dwell Test:** Set an asset zone; remain within it for >N seconds to verify alert trigger.
*   **Privacy Check:** Network tab inspection to verify zero data transmission to external servers during operation.
```