```markdown
# research.md: Technical Architecture Analysis for Retail Optics

## 1. Summary of Stack Constraints
Retail Optics operates under a "Client-Side First" mandate, which introduces specific technical constraints:
*   **Execution Environment**: Browser-based execution implies reliance on WebGL/WebGPU. Memory management is critical; models must fit within the VRAM footprint of consumer-grade hardware.
*   **Privacy-First**: No data exfiltration. All processing must happen in-memory. Persistence (if any) must leverage IndexedDB or local browser storage.
*   **Latency Requirements**: Real-time inference necessitates frames-per-second (FPS) optimization, favoring smaller, quantized models over high-precision architectures.
*   **Hardware Heterogeneity**: Performance will vary drastically between high-end workstations and low-power retail tablets/POS terminals.

## 2. Integration Challenges & Edge Cases

### Gotchas
*   **Main Thread Blocking**: Running heavy inference tasks directly on the main thread will freeze the UI. Web Workers (OffscreenCanvas) are mandatory to maintain a responsive dashboard.
*   **Lighting Variability**: Retail environments feature dynamic lighting (flicker, reflections). Standard COCO-SSD models may struggle with glint on glass or harsh backlighting.
*   **Occlusion**: The queue analytics and asset protection modules will face high occlusion rates. Centroid-association can "flicker" or lose IDs when humans overlap.

### Edge Cases & Error Handling
*   **GPU Context Loss**: WebGL context can be lost if the browser or OS reclaims GPU resources. A robust recovery flow (re-initializing the model) is required.
*   **Browser Throttling**: Background tabs or low-power modes will throttle requestAnimationFrame. The system needs a fallback or notification state when FPS drops below a usable threshold (e.g., <5 FPS).
*   **Insecure Contexts**: WebGPU/WebGL hardware acceleration often requires Secure Contexts (HTTPS/Localhost).

## 3. Technical Recommendations

### Recommended Stack & SDKs
*   **Inference Engine**: 
    *   **TensorFlow.js (TFJS)**: Best ecosystem maturity for WebGL/WebGPU.
    *   **MediaPipe**: Highly recommended for the "Fall Guardian" and "Queue Analytics" modules as its pose-detection and bounding-box tracking are highly optimized for mobile/browser hardware.
*   **State Management**: Use `SharedArrayBuffer` to pass frame data between the main thread and Web Workers to minimize memory copying overhead.

### Scaling & Performance Optimization
*   **Model Quantization**: Utilize Int8 or Float16 quantization to reduce the model binary size and increase inference speed.
*   **Frame Dropping**: Implement a strategy where only every 3rd or 5th frame is processed for inference, while tracking objects between frames using lightweight motion estimation (e.g., Lucas-Kanade optical flow) to maintain smooth visualizations.
*   **Heatmap Caching**: Rather than updating the heatmap every frame, cache a low-resolution canvas/grid buffer and perform cumulative updates at a lower frequency (e.g., 1Hz) to save CPU cycles.

### Data Persistence
*   **IndexedDB**: Use for local caching of heatmaps and dwell-time logs across session restarts, utilizing libraries like `idb` for simplified async operations.
```