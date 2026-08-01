# Project Nexus - Technical Specification Document

## 1. Project Overview & Business Strategy

### 1.1 Purpose & Objectives
Project Nexus modernizes our consumer-facing web portal to address a 25% drop in user retention and optimize mobile experience. By delivering a fast, responsive web interface integrated with self-service billing capabilities, Project Nexus aims to reduce customer service call volumes by 40% within six months of deployment.

### 1.2 Phased Rollout Plan
To mitigate execution risk and accelerate time-to-value, deployment is divided into two distinct phases:

*   **Phase 1: Consumer Portal Modernization & Telemetry (Retention Focus)**
    *   Re-architect the web frontend using a modern responsive framework delivered via Edge CDN.
    *   Embed comprehensive product analytics telemetry (session tracking, user interaction funnels, drop-off points) to validate whether performance improvements directly correlate with retention recovery.
*   **Phase 2: Self-Service Billing Capabilities**
    *   Integrate self-service billing, payment method management, subscription management, and billing dispute capabilities.

---

## 2. System Architecture & Design

### 2.1 Edge Delivery & Frontend Architecture
*   **Edge Delivery**: Global Edge CDN and serverless edge runtime to serve static assets and perform edge-side rendering/caching.
*   **Responsive Framework**: Mobile-first design principles guaranteeing fluid adaptability across desktop, tablet, and mobile viewport sizes.

### 2.2 Billing Integration Strategy

#### Primary Architecture: Managed Vendor Customer Portal (Mandated Default)
To eliminate PCI-DSS compliance overhead, custom transactional engine maintenance, and binary/state caching failure modes, Project Nexus mandates the integration of an out-of-the-box, PCI-compliant managed customer portal (e.g., Stripe or Braintree Customer Portal).
*   **Scope Offloaded**: PCI compliance, payment method collection/updates, payment method tokenization, PDF invoice generation, and transactional billing state management.
*   **Integration Method**: Secure SSO/session token exchange redirecting or embedding vendor portal frames securely.

#### Secondary Architecture: Custom Billing Fallback Rules
If business requirements dictate a custom billing interface instead of the managed portal, implementation must adhere strictly to the following boundaries:
*   **MVP Scope Boundary**: Custom billing scope is strictly capped at three capabilities:
    1. View Billing History
    2. Update Payment Method
    3. Cancel / Pause Subscription
*   **Transactional Caching Guardrail**: Volatile transactional billing states (e.g., real-time account balance, current invoice status, payment completion states) **MUST NOT** be cached in Redis or in-memory dynamic caches without strict event-driven invalidation. Any allowed caching must use explicit Change Data Capture (CDC) or Pub/Sub event-driven cache invalidation triggers directly connected to the transactional database.

### 2.3 Binary Payload & Data Ingestion Architecture

To prevent API gateway timeouts (504) and Out-Of-Memory (OOM) application worker crashes, all file uploads (e.g., billing dispute evidence, account verification documents) and heavy processing operations (e.g., custom document generation) must bypass application worker threads entirely.

```
+--------+           +-------------------+           +---------------+
| Client | --------> | Portal API Server | --------> |  AWS S3 Store |
+--------+           +-------------------+           +---------------+
    |                  (Generates URL)                       ^
    |                                                        |
    +-------------------- Direct Upload via Presigned URL ---+
    |
    v
+-------------------+           +---------------+           +-----------------+
| Portal API Server | --------> | SQS / Queue   | --------> | Background Worker|
+-------------------+           +---------------+           +-----------------+
  Returns 202 Accepted            Job Message                Asynchronous Processing
```

1.  **Direct-to-Storage Presigned URLs**: Clients request a short-lived presigned upload URL from the API. Binary payloads are uploaded directly from the client browser to Cloud Storage (AWS S3 / Google Cloud Storage).
2.  **Asynchronous Background Job Queues**: Upon upload completion, a lightweight notification trigger dispatches a job message to an asynchronous queue (e.g., AWS SQS, RabbitMQ).
3.  **Non-Blocking API Response**: Application APIs accept binary/processing operations by returning an immediate `202 Accepted` status along with a job ID and status polling endpoint. Background worker pools execute heavy file/document processing completely out-of-band.

---

## 3. API & Data Specifications

### 3.1 REST API Specification

#### 1. Session & Telemetry Tracking
*   **`POST /api/v1/telemetry/events`**
    *   *Description*: Captures user interaction, route changes, and funnel drop-off events.
    *   *Response*: `204 No Content`

#### 2. Presigned URL Request for Uploads
*   **`POST /api/v1/billing/disputes/upload-url`**
    *   *Request Body*:
        ```json
        {
          "filename": "receipt_statement.pdf",
          "contentType": "application/pdf",
          "contentLengthBytes": 2048576
        }
        ```
    *   *Response*: `200 OK`
        ```json
        {
          "uploadUrl": "https://nexus-storage.s3.amazonaws.com/disputes/doc-98234.pdf?AWSAccessKeyId=...",
          "fileKey": "disputes/doc-98234.pdf",
          "expiresInSeconds": 300
        }
        ```

#### 3. Asynchronous Job Trigger & Status
*   **`POST /api/v1/billing/disputes`**
    *   *Request Body*:
        ```json
        {
          "disputeReason": "incorrect_charge",
          "fileKey": "disputes/doc-98234.pdf"
        }
        ```
    *   *Response*: `202 Accepted`
        ```json
        {
          "jobId": "job-77123-abc",
          "status": "QUEUED",
          "statusEndpoint": "/api/v1/jobs/job-77123-abc"
        }
        ```

*   **`GET /api/v1/jobs/{jobId}`**
    *   *Response*: `200 OK`
        ```json
        {
          "jobId": "job-77123-abc",
          "status": "COMPLETED",
          "updatedAt": "2026-03-30T10:15:30Z"
        }
        ```

#### 4. System Observability & Health
*   **`GET /healthz/live`**
    *   *Description*: Liveness probe verifying server instance execution.
    *   *Response*: `200 OK` -> `{"status": "UP"}`
*   **`GET /healthz/ready`**
    *   *Description*: Readiness probe evaluating backend dependencies, billing service connectivity, and message queue lag.
    *   *Response*: `200 OK` or `503 Service Unavailable`
        ```json
        {
          "status": "READY",
          "checks": {
            "database": "UP",
            "queueLag": "OK",
            "billingPortal": "UP"
          }
        }
        ```

---

## 4. Non-Functional Requirements (NFRs) & SLAs

### 4.1 Core Web Vitals Standards (Client Performance)
All consumer portal views must comply with the following p95 thresholds:
*   **Largest Contentful Paint (LCP)**: $\le 2.5$ seconds.
*   **Interaction to Next Paint (INP)**: $\le 200$ milliseconds.
*   **Cumulative Layout Shift (CLS)**: $\le 0.1$.

### 4.2 API Performance & Latency SLAs
*   **Standard Web Portal APIs**: Response latency $\le 200$ ms at p99.
*   **Billing Query Endpoints (Fallback Custom Billing)**: Response latency $\le 300$ ms at p99.
*   **Asynchronous Processing Handshake**: Direct upload presigned URL request & job submission endpoints latency $\le 100$ ms at p99.

### 4.3 Security & Compliance
*   **PCI-DSS Scope Elimination**: Fully offloaded to managed customer portal vendor (Stripe/Braintree).
*   **Data Access Authorization**: Mandate Row-Level Security (RLS) or session metadata pre-filtering on all data layer and vector/search queries based on the authenticated user's verified identity.

---

## 5. DevOps, CI/CD, & Observability

### 5.1 CI/CD Quality Gates
*   **Automated Performance Audits**: Every pull request and release build must run synthetic Lighthouse / Core Web Vitals tests in headless runners. Builds failing LCP, INP, or CLS targets are automatically rejected.
*   **Security & Compliance Scanning**: Automated static analysis to prevent inclusion of custom card collection forms or volatile database caching without event triggers.

### 5.2 Progressive Deployment Strategy
*   **Canary Deployments**: Route 5% of user traffic to new web builds, scaling progressively (10% -> 25% -> 50% -> 100%) over defined evaluation windows.
*   **Automated Rollback Triggers**: Automated deployment rollback is executed immediately if:
    *   HTTP 5xx error rates exceed 0.5% over a 5-minute window.
    *   API p99 latency spikes above 500ms.
    *   Health check `/healthz/ready` reports readiness failures.

### 5.3 Observability Framework
*   **Queue Depth & Lag Tracking**: Continuous monitoring of job queue depths and worker processing delays with alerting thresholds.
*   **Real User Monitoring (RUM)**: Real-time telemetry ingest to track Core Web Vitals and user drop-off funnels across distinct device classes and geographies.