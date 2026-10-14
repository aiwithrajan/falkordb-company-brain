# ADR-042: Migration from AUTH-V1 to Asymmetric AUTH-V2

- **Decision ID**: `DEC-042`
- **Document ID**: `DOC-DEC-042`
- **Author**: Marcus Vance (Principal Architect, Core Platform)
- **Approved By**: Alex Chen (VP of Engineering)
- **Approved Date**: 2026-09-15
- **Status**: Approved / Current Policy

## 1. Context
Following the P0 outage during Incident INC-8812, shared symmetric keys in AUTH-V1 were identified as a critical vulnerability and latency bottleneck.

## 2. Decision
> "All tier-1 services, specifically including `payments-svc` and `identity-svc`, are REQUIRED to adopt **AUTH-V2** (asymmetric RS256 JWT tokens with automatic public-key rotation every 24 hours). Legacy AUTH-V1 endpoints will be deprecated and deactivated on November 1, 2026."

## 3. Implementation Lead
Elena Rostova (Tech Lead, Core Platform) is designated as the migration owner.
