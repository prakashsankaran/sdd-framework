# Decision Log

# decision_log.md

### Decision: Hybrid Async-First Architecture
- **Reason**: Transitioning from synchronous, monolithic processing to asynchronous, event-driven patterns prevents thread exhaustion and OOM (Out of Memory) errors. This ensures the frontend remains responsive for reception staff while offloading side effects like notifications and reporting.
- **Approved By**: Debate Moderator Board, CEO
- **Confidence**: High

### Decision: Dual-Token Authentication Strategy
- **Reason**: Implementation of short-lived access tokens combined with secure, `HttpOnly` refresh tokens balances the need for security (token revocation) with the requirement for a frictionless user experience.
- **Approved By**: Debate Moderator Board, CEO
- **Confidence**: High

### Decision: Schema Normalization and Audit Separation
- **Reason**: Decoupling `Visitors` (Master Data) and `Visits` (Transactional) enables RTBF (Right to be Forgotten) compliance. Dedicated, immutable audit logs protected by triggers ensure data integrity and security compliance.
- **Approved By**: Debate Moderator Board, CEO
- **Confidence**: High

### Decision: Presigned URL Binary Handling
- **Reason**: Offloading file uploads directly to object storage via presigned URLs removes heavy binary processing from the application server, lowering infrastructure costs and mitigating OOM risks.
- **Approved By**: Debate Moderator Board, CEO
- **Confidence**: High

### Decision: PII Lifecycle Management (TTL)
- **Reason**: Automatic sanitization of PII records older than 48 hours post-checkout significantly reduces legal and regulatory exposure regarding data privacy.
- **Approved By**: Debate Moderator Board, CEO
- **Confidence**: High

### Decision: Authorization Interceptor
- **Reason**: Implementation of a service-layer interceptor validating `department_id` or `user_id` context provides a hard defense against BOLA (Broken Object Level Authorization) vulnerabilities.
- **Approved By**: Debate Moderator Board, CEO
- **Confidence**: High

### Decision: Performance and Scalability Requirements
- **Reason**: Mandatory pagination for `GET` endpoints and streaming CSV generation for reports are required to prevent memory exhaustion as the system scales.
- **Approved By**: Debate Moderator Board, CEO
- **Confidence**: High

### Decision: Telemetry and Observability Priority
- **Reason**: Because asynchronous architectures increase complexity in system monitoring, the SRE team must prioritize the telemetry layer in the upcoming development cycle.
- **Approved By**: CEO
- **Confidence**: High