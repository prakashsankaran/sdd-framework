# plan.md

## 1. Summary of Architecture
**Retail Optics** follows a client-side, browser-based architecture. It leverages the **TensorFlow.js (TF.js)** ecosystem to execute the COCO-SSD model directly on the user's hardware via WebGL/WebGPU acceleration. 

- **Processing Pipeline**: `Video Stream` -> `Frame Grabber` -> `TF.js Inference` -> `Spatial Logic Engine` -> `Visualization Layer (Canvas)`.
- **Privacy Model**: Zero-data-persistence architecture; frames are processed in volatile memory and discarded immediately after inference.
- **State Management**: Reactive store to handle real-time bounding box coordinates and occupancy counts.

---

## 2. Components, Directories, and Files
### Directory Structure
```text
/src
  /assets        # Pre-trained models (COCO-SSD)
  /components    # UI Layout (Dashboard, Settings, VideoView)
  /hooks         # Logic (useVideo, useInference, useAnalytics)
  /services      # Tensor operations & Math utilities
  /engine        # Core detection logic (Spatial Engine)
```

### Key Files
- `engine/Detector.ts`: Manages TF.js model loading and inference loop.
- `engine/Analytics.ts`: Logic for Queue, Fall, Asset, and Heatmap algorithms.
- `hooks/useVideo.ts`: MediaDevices API handling for camera streams.
- `services/MathUtils.ts`: Centroid association, Gaussian kernels, and bounding box math.

---

## 3. Phased Implementation Schedule

| Phase | Duration | Focus |
| :--- | :--- | :--- |
| **Phase 1: Setup** | Week 1 | Environment config, TF.js integration, and WebGL stream capture. |
| **Phase 2: Analytics Core** | Week 2-3 | Implementing Queue counting and Fall Guardian (aspect ratio logic). |
| **Phase 3: Spatial Engine** | Week 4 | Asset Protection (centroid tracking) and Heatmap Gaussian overlay. |
| **Phase 4: UI/UX** | Week 5 | Dashboard layout, alerting system, and real-time visualization layer. |
| **Phase 5: Optimization** | Week 6 | Model quantization, memory leak cleanup, and performance profiling. |

---

## 4. Verification Plan

### Automated Testing
- **Unit Tests**: Jest tests for `MathUtils.ts` (e.g., ensure Gaussian kernel output is valid, verify aspect ratio thresholds).
- **Inference Stability**: Smoke tests in `Detector.ts` to ensure `tf.dispose()` is called on every frame to prevent memory leaks.

### Test Routes & Scenarios
1. **Queue Analytics**: Feed a controlled video loop of 1-5 people; verify count accuracy within a 90% threshold.
2. **Fall Guardian**: Inject a mock JSON stream where object aspect ratio shifts from >1.0 to <0.5; verify alert trigger.
3. **Asset Protection**: Define a coordinate polygon; trigger a mock event when a centroid dwells for >10s.

### Manual Test Validation Flows
- **Performance Stress Test**: Monitor `chrome://gpu` and browser memory heap during 30 minutes of continuous operation.
- **Browser Compatibility**: Cross-verify WebGL rendering across Chrome, Edge, and Firefox.
- **Privacy Check**: Open Network tab; verify zero outgoing traffic (excluding initial model load) to ensure no frame egress.