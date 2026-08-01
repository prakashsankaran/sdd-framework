# Decision Log

# Project Nexus — Decision Log

### Decision: Managed Third-Party Billing Portal Integration (Phase 2 Primary Strategy)
- **Reason**: Mandates using an out-of-the-box, PCI-compliant vendor customer portal (such as Stripe or Braintree) as the primary billing integration path. This completely eliminates custom transactional billing engine design, bypasses high-cost PCI-DSS compliance audits, avoids handling custom file upload vulnerabilities, and reduces development time by an estimated 6–8 weeks.
- **Approved By**: AI Specification Review Board (AI-SRB) & Office of the CEO
- **Confidence**: 95%+

### Decision: Strict Prohibition of Volatile Transactional Billing Caching
- **Reason**: Explicitly forbids caching volatile transactional billing states (e.g., balances and payment statuses) in Redis or local memory unless accompanied by strict, event-driven invalidation triggers (such as Change Data Capture or Pub/Sub events). This directly mitigates the risks of data desynchronization and double-billing experienced in previous platform releases.
- **Approved By**: AI Specification Review Board (AI-SRB) & Office of the CEO
- **Confidence**: 95%+

### Decision: Asynchronous Uploads and Direct-to-Storage Presigned URLs
- **Reason**: Requires all binary payloads, document uploads (e.g., dispute verification), and heavy processing (e.g., PDF generation) to bypass application server worker threads entirely. Clients will upload documents directly to cloud storage (e.g., AWS S3) using short-lived presigned URLs. Downstream processing will run asynchronously via background message queues (SQS/RabbitMQ) and return an immediate `202 Accepted` status to prevent API gateway timeouts (504) and Out-Of-Memory (OOM) server crashes.
- **Approved By**: AI Specification Review Board (AI-SRB) & Office of the CEO
- **Confidence**: 95%+

### Decision: Implementation of a Two-Phase Phased Rollout
- **Reason**: De-risks implementation by separating front-end/UX modernization risks from transactional backend risks. Phase 1 focuses exclusively on modernizing the consumer-facing portal on an Edge CDN with telemetry. Phase 2 introduces the self-service billing integration workflows.
- **Approved By**: AI Specification Review Board (AI-SRB) & Office of the CEO
- **Confidence**: 95%+

### Decision: Integration of Mandated Product Telemetry
- **Reason**: Resolves potential causation fallacies by mandating product analytics and session-tracking telemetry (configured at `/api/v1/telemetry/events`) in Phase 1. This telemetry scientifically isolates and proves whether UX and performance modernizations directly correlate with recovering the 25% retention drop.
- **Approved By**: AI Specification Review Board (AI-SRB) & Office of the CEO
- **Confidence**: 95%+

### Decision: Quantifiable Core Web Vitals and Latency SLA Guardrails
- **Reason**: Establishes strict, objective, and measurable performance thresholds to replace subjective speed requirements. Specifically:
  - Largest Contentful Paint (LCP) $\le$ 2.5 seconds (p95)
  - Interaction to Next Paint (INP) $\le$ 200 milliseconds (p95)
  - Cumulative Layout Shift (CLS) $\le$ 0.1 (p95)
  - Standard Portal APIs latency $\le$ 200 milliseconds (p99)
  - Billing query endpoints latency $\le$ 300 milliseconds (p99)
- **Approved By**: AI Specification Review Board (AI-SRB) & Office of the CEO
- **Confidence**: 95%+

### Decision: CI/CD Quality Gates, Health Observability, and Canary Releases
- **Reason**: Safeguards the production environment from performance regressions and downtime. The pipeline will enforce automated synthetic Lighthouse / Core Web Vitals checks to block non-compliant builds, utilize `/healthz` endpoints to monitor queue lag and billing connectivity, and deploy via progressive Canary releases with automated rollback triggers if HTTP 5xx rates exceed 0.5% or p99 latency spikes above 500ms.
- **Approved By**: AI Specification Review Board (AI-SRB) & Office of the CEO
- **Confidence**: 95%+

## Tracked Agent Opinion Changes

| Agent | Initial Position | Revised Position | Reason |
| --- | --- | --- | --- |
| Architect | NEEDS CLARIFICATION (25%) | NEEDS CLARIFICATION (98%) | Exposed to and incorporated concerns raised by other board members. |
| Performance | APPROVED (25%) | NEEDS CLARIFICATION (95%) | Exposed to and incorporated concerns raised by other board members. |
| DevOps | NEEDS CLARIFICATION (25%) | NEEDS CLARIFICATION (95%) | Exposed to and incorporated concerns raised by other board members. |
