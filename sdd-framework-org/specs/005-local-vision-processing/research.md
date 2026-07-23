# research.md

## 1. Summary of Stack Constraints
Retail Optics operates under a "Browser-as-a-Platform" model, necessitating a strictly client-side architecture. Key constraints include:
*   **Computation**: Heavily reliant on WebGL-accelerated TensorFlow.js. Performance is gated by the browser’s ability to offload tensors to the GPU.
*   **Persistence**: IndexedDB is the primary data store. Security mandates require AES-GCM encryption at the application layer, adding significant overhead to CRUD operations.
*   **Privacy**: Zero-persistence of raw video data implies that all telemetry must be extracted *in-flight* (during the inference loop), leaving no room for retrospective model training on stored data.
*   **Concurrency**: The main thread must remain unblocked for UI responsiveness while the video pipeline runs at 15 FPS; usage of Web Workers is non-negotiable.

## 2. Integration Challenges & Edge Cases
*   **Performance Jitter**: Browser tab throttling (when inactive) and thermal throttling on lower-end hardware will cause inconsistent frame rates. 
    *   *Mitigation*: Implement a dynamic frame-skipping logic that reduces inference frequency when system telemetry detects latency.
*   **Coordinate Transformation**: Aligning screen-space polygon coordinates (`zone_configuration`) with native video resolution is prone to scaling errors (DPI awareness).
    *   *Challenge*: Recalibrating coordinates if the video element's aspect ratio changes dynamically.
*   **False Positives in 'Fall Guardian'**: The current ratio-based logic (`H:W < 0.5`) is prone to errors when people are sitting or near objects. 
    *   *Error State Handling*: The system must implement a "temporal validation" window (e.g., must stay in horizontal orientation for >2 seconds) to avoid trigger spikes.
*   **Memory Pressure**: TensorFlow.js model weights and temporary tensor allocations can trigger garbage collection (GC) stutters.
    *   *Gotcha*: `tf.tidy()` must be rigorously used to prevent GPU memory leaks.

## 3. Recommendations
### Scaling & Caching
*   **Compute Offloading**: Utilize `OffscreenCanvas` to move rendering logic to a background Web Worker, ensuring that dashboard UI updates do not stutter during heavy detection loads.
*   **Cache Strategy**: Implement a tiered caching strategy where real-time metrics (`/analytics/stream`) reside in an in-memory ring buffer (JS object) before being flushed to the encrypted IndexedDB at configurable intervals.

### Third-Party SDKs / Tools
*   **Model Optimization**: If COCO-SSD is too heavy, consider **MediaPipe (Pose Landmarker)**. It offers superior performance for limb-based detection, which is more reliable for 'Fall Guardian' logic than generic bounding boxes.
*   **Encryption**: Use **PouchDB** with the `pouchdb-adapter-indexeddb` and the `pouchdb-encryption` plugin. This abstracts the complexity of `SubtleCrypto` management and provides sync capabilities if a local server sidecar is introduced later.
*   **State Management**: Use **XState** for the UI/Alerting lifecycle. Managing transitions between `IDLE`, `DETECTING_FALL`, `LOGGING`, and `ALERTING` is complex; a finite state machine will prevent race conditions in incident logging.
*   **Validation**: Implement **Zod** for runtime schema validation on the API responses and configuration payloads to ensure the integrity of geometry inputs before they reach the `store_config` database.