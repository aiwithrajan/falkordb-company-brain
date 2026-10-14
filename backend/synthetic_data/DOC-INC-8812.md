# Post-Mortem: Incident INC-8812 (Payments Auth Failure)

- **Incident ID**: `INC-8812`
- **Severity**: P0 (Revenue Impacting)
- **Occurred**: 2026-08-20T14:22:00Z
- **Resolved**: 2026-08-20T17:45:00Z
- **Incident Commander**: Elena Rostova (Core Platform)
- **Participating Engineers**: Sarah Kim (Monetization), David Kumar (Infrastructure)

## 1. Summary
A catastrophic cascade of authentication timeouts occurred between `payments-svc` and `identity-svc` when legacy AUTH-V1 shared keys expired without graceful rotation. Over 42,000 checkout attempts failed before manual rollback.

## 2. Root Cause
`payments-svc` relied on static AUTH-V1 HMAC validation. When Identity rotated its key buffer, Payments rejected valid user tokens.

## 3. Corrective Actions
1. Emergency hotfix deployed by Elena Rostova.
2. Architecture team commanded to draft ADR-042 requiring AUTH-V2 across all payments and identity pathways.
