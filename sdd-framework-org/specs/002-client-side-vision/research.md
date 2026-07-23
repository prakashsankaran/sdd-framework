# research.md

## 1. Summary of Stack Constraints
Retail Optics operates under a strict "Client-Side Only" paradigm. The stack must optimize for high-throughput browser-based inferencing without degrading the user experience.

*   **Runtime Environment**: Browser (Chrome/Edge/Firefox). Performance relies heavily on `WebGPU` (preferred) or `WebGL` (fallback).
*   **Model Format**: TensorFlow.js (TFJS) is the standard for web-based graph execution.
*   **Resource Management**: Memory is capped by the browser tab. Large models (e.g., YOLOv8) risk `Out of Memory` (OOM) errors; quantization (FP16/INT8) is mandatory.
*   **Concurrency**: Heavy processing occurs on the main thread unless strictly offloaded to **Web Workers**, which is necessary to prevent UI freezing during inference frames.

## 2. Evaluation of Integration Challenges
The shift from server-side to client-side introduces specific "gotchas" regarding reliability and hardware variance.

*   **Hardware Fragmentation**: Not all client devices possess dedicated GPUs. A fallback path to CPU (WASM) will significantly increase latency, potentially breaking real-time requirements (e.g., "Fall Guardian" lag).
*   **Camera Permission/State**: Browser permission handling is restrictive. If a camera feed is interrupted (power saving mode, tab sleeping), the application state must handle recovery without manual refresh.
*   **Lighting & Occlusion (Edge Cases)**: 
    *   **Queue Analytics**: High occlusion in busy stores will lead to bounding box jitter. Smoothing algorithms (Kalman Filters) are required to prevent flickering counts.
    *   **Fall Guardian**: Aspect ratio analysis is prone to false positives from non-human objects (e.g., stacked inventory). Requires strict confidence thresholding.
*   **Privacy/Security**: While "client-side" implies privacy, ensure local storage of incident logs does not violate local data governance (e.g., GDPR/CCPA) if cached locally in IndexedDB.

## 3. Technical Recommendations

### Scaling & Performance
*   **Frame Dropping**: Do not process every frame of a 30fps stream. Implement an adaptive frame-skipping strategy (e.g., process every 5th or 10th frame) to maintain a balance between accuracy and thermal throttling.
*   **WebGPU Acceleration**: Prioritize `tfjs-backend-webgpu`. It provides significantly higher compute performance than `webgl` for heavy spatial analytics.
*   **Quantization**: Use `tfjs-converter` to quantize models to 8-bit integers. This reduces the binary size and speeds up execution with negligible loss in accuracy for retail use cases.

### Caching & Storage
*   **IndexedDB**: Use for caching incident logs and periodic heatmap data snapshots. Do not use LocalStorage, as it is synchronous and blocks the main thread.
*   **Model Caching**: Leverage the `IndexedDB` caching feature in TensorFlow.js to prevent re-downloading model weights on application reload.

### Third-Party SDK Choices
*   **Core Logic**: [TensorFlow.js](https://www.tensorflow.org/js) (Standard, robust ecosystem).
*   **Alternative for Speed**: [MediaPipe](https://developers.google.com/mediapipe) (Highly optimized for posture/human detection, better than COCO-SSD for "Fall Guardian" scenarios).
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Lightweight for React-based UI/Dashboard updates).
*   **Visualization**: [PixiJS](https://pixijs.com/) for rendering the heatmap overlays, as it provides hardware-accelerated 2D graphics that won't lag the dashboard UI.