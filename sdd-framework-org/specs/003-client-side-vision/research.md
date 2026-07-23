```markdown
# research.md: Architectural Analysis for Retail Optics

## 1. Summary of Stack Constraints
Retail Optics operates under a strict "Client-Side Only" paradigm. This dictates several critical architectural constraints:
*   **Compute Budget:** Processing must be offloaded to the user’s local GPU/CPU. High-resolution streams or multiple simultaneous camera feeds will compete with the browser’s main thread, potentially causing frame drops or UI freezing.
*   **Memory Footprint:** WebGL/WebGPU context limits are restrictive. Model weights (COCO-SSD) must be kept resident in memory, and frame buffers must be managed to prevent memory leaks in long-running sessions.
*   **Data Persistence:** Without a backend, long-term storage is restricted to IndexedDB or local browser storage. Data persistence between sessions is not guaranteed if the browser clears cache.
*   **Dependency Limits:** All logic must be compatible with standard Browser APIs (Web Workers, MediaStream API, WebGL/WebGPU).

## 2. Integration Challenges & Edge Cases
### Potential Gotchas
*   **Hardware Fragmentation:** Performance variability between a high-end desktop and a legacy tablet. Using `tfjs-backend-webgl` or `webgpu` requires robust fallback detection.
*   **Browser Permissions:** Persistent access to camera media streams is often revoked or blocked by browser security policies if the tab is not focused.
*   **Variable Lighting:** Retail environments feature flickering fluorescent lights, glare, and shadows which significantly degrade the accuracy of standard COCO-SSD models.

### Error State Handling
*   **Resource Exhaustion:** If GPU memory is exceeded, the application must implement a "Degradation Strategy" (e.g., dropping frame resolution, reducing inference frequency from 30fps to 5fps, or disabling secondary features like heatmapping).
*   **Privacy Exceptions:** Browser updates frequently change cross-origin policies; any external CDN-hosted model weights must be served with proper CORS headers.

## 3. Scaling, Caching, and SDK Recommendations

### Scaling Strategy
*   **Web Workers:** Offload all inference tasks to a dedicated Web Worker to prevent UI blocking. 
*   **RequestAnimationFrame (rAF):** Use rAF for the main loop to synchronize processing with the browser’s refresh rate, ensuring smooth rendering of overlays without bottlenecking the inference engine.
*   **Subsampling:** For Heatmap generation, do not process every frame. Accumulate data at a lower frequency (e.g., 2fps) to reduce CPU load while maintaining long-term spatial accuracy.

### Caching
*   **Model Caching:** Utilize the Cache API or IndexedDB to store the COCO-SSD weights after the initial fetch. This allows for offline-first startup capability.
*   **State Serialization:** For Heatmaps, store cumulative buffers as compact `Uint8Array` blobs rather than high-resolution images to minimize the memory footprint in IndexedDB.

### Third-Party SDK Recommendations
*   **Core Logic:** [TensorFlow.js (TFJS)](https://www.tensorflow.org/js) is the industry standard for client-side ML. Use the `tfjs-backend-webgpu` backend where available for significant performance gains over legacy WebGL.
*   **Video Processing:** [MediaPipe (by Google)](https://mediapipe.dev/) provides high-performance, platform-optimized primitives for object detection that often outperform standard COCO-SSD implementations in browser environments.
*   **UI/Rendering:** [PixiJS](https://pixijs.com/) is recommended for rendering the Heatmap overlays; it offers high-performance 2D WebGL acceleration that integrates well with live video canvas streams.
```