## 1. Executive Summary

**Retail Optics** is a multi-modal computer vision operations dashboard designed for retail environments. It operates entirely on the client-side, ensuring privacy and eliminating backend latency. Using the device's GPU/CPU via WebGL, it runs deep learning object detection (COCO-SSD) over live or recorded video streams to provide real-time spatial analytics.

### Core Capabilities:
1. **Queue Analytics**: Counts humans in frame to predict and alert on checkout lane congestion.
2. **Fall Guardian**: Analyzes bounding box aspect ratios to detect slip-and-fall incidents.
3. **Asset Protection**: Establishes high-value bounding zones and tracks dwell times using centroid-association to detect suspicious lingering.
4. **Heatmap Generation**: Generates a cumulative spatial density overlay using 2D Gaussian kernels.
