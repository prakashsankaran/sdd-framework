# plan.md

## 1. Summary of Architecture
**Retail Optics** follows a client-side, edge-first architecture. The application leverages **TensorFlow.js (TF.js)** to execute the COCO-SSD model within the browser's main thread (or Web Worker) using the **WebGL/WebGPU backend**. 

- **Video Processing Engine**: Handles media stream capture via `getUserMedia` or HTML5 Video elements.
- **Inference Pipeline**: Normalizes frame buffers, performs model inference, and returns detection tensors.
- **Logic Layer**: Processes raw bounding box data into business intelligence (Queue counts, Fall detection, Dwell tracking).
- **Visualization Layer**: Canvas-based rendering for overlays, heatmaps, and bounding boxes.

---

## 2. Components, Directories, and Files

### Structure
```text
/src
  /assets           # UI assets
  /engine
    model.js        # TF.js initialization & COCO-SSD loading
    processor.js    # Frame processing loop
  /analytics
    queue.js        # Logic for people counting
    fall.js         # Aspect ratio logic
    dwell.js        # Centroid association tracking
    heatmap.js      # Gaussian kernel implementation
  /ui
    overlay.js      # Canvas drawing functions
    dashboard.js    # Stats reporting
  index.html        # Main app entry
```

### Key Files
- `engine/model.js`: Configures `tf.setBackend('webgl')` and loads the model.
- `analytics/dwell.js`: Implements an `ObjectMap` to track centroids across frames.
- `analytics/heatmap.js`: Maintains a 2D array representing pixel density, updating via Gaussian kernel convolution.

---

## 3. Phased Implementation Schedule

### Phase 1: Core Engine (Week 1)
- Setup project with Vite/Webpack.
- Implement video stream capture and TF.js base initialization.
- Establish the `requestAnimationFrame` render loop.

### Phase 2: Analytics Modules (Week 2)
- Develop Queue counting logic (Filtering by 'person' class).
- Implement Aspect Ratio math for `Fall Guardian`.
- Create Centroid-Association tracker for `Asset Protection`.

### Phase 3: Visualization & Heatmap (Week 3)
- Implement 2D Gaussian Kernel for heatmaps.
- Build the Canvas overlay system.
- Integrate UI dashboard for real-time alerts.

### Phase 4: Optimization & Refinement (Week 4)
- Web Worker migration for background inference.
- GPU performance tuning.
- Privacy compliance audit (ensuring no data exits the client).

---

## 4. Verification Plan

### Automated Scripts
- **Unit Tests (Jest)**: Verify spatial logic (e.g., "Do two bounding boxes trigger the dwell timer?").
- **Performance Benchmarks**: `Lighthouse` audits to ensure frame processing remains > 20 FPS.

### Test Routes (Scenarios)
1. **Stress Test**: Run 4+ video streams simultaneously to test WebGL resource limits.
2. **Edge Case**: Test occlusion (people walking behind each other) and low-light environmental scenarios.
3. **Recovery**: Simulate stream interruptions (closing/reopening camera) to ensure model state resets correctly.

### Manual Validation Flows
- **Queue Validation**: Count humans manually vs. counter UI for 10-minute intervals.
- **Fall Detection**: Use a reference video of a fall; verify the alert triggers within < 500ms of the aspect ratio change.
- **Heatmap Accuracy**: Compare generated heatmap against a known static layout to verify density clusters match high-traffic areas.