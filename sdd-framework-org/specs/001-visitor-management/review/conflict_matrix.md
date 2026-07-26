# Conflict Resolution Matrix

| Conflict Area | Competing Viewpoints | Resolution | Evidence/Reasoning |
| :--- | :--- | :--- | :--- |
| **System Complexity** | "Keep it simple" (Devil's Advocate) vs. "Async/Queues needed" (Architect/Performance) | **Hybrid Approach**: Use lightweight async patterns to avoid blocking the API thread. | Historical incidents of OOM/Timeout in similar projects confirm that synchronous side effects are the primary cause of downtime. |
| **Authentication** | "Re-login often" (Security) vs. "UX nightmare" (Devil's Advocate) | **Dual-Token Pattern**: Short-lived access tokens + Secure HttpOnly Refresh tokens. | Balances security (revocation) with the receptionist’s need for continuous, fast-paced workflow. |
| **Audit/PII Integrity** | "One DB for all" (Devil's Advocate) vs. "Normalized/Decoupled" (Data Architect/Compliance) | **Schema Split + Append-Only Audit**: Split `Visitors` and `Visits`; decouple audit logs. | Ensures RTBF (Right to be Forgotten) compliance while maintaining immutable security logs. |
| **Data Storage** | "Database BLOBs" (Initial Draft) vs. "Presigned URLs" (Performance/Security) | **Presigned URLs**: Mandatory. | Eliminates OOM risks and offloads binary processing to storage providers. |