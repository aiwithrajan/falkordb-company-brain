# RFC-102: Payments Service Architecture Overview

- **Document ID**: `DOC-RFC-102`
- **Author**: Sarah Kim (Senior Staff Engineer, Monetization Team)
- **Date**: 2024-03-10
- **Status**: Historical / Deprecated Configuration Reference

## 1. Overview
The Payments Service (`payments-svc`) handles credit card transactions, subscription charges, and third-party merchant reconciliation for Nexora Cloud. 

## 2. Authentication Protocol (Section 4.2)
> "All incoming inter-service requests to the Payments API MUST authenticate against the Identity Service (`identity-svc`) using the standard **AUTH-V1** shared symmetric key and legacy HMAC signature header (`X-Nexora-Auth-V1`). Requests without this signature will be rejected with HTTP 401."

## 3. Dependencies
- Upstream: `checkout-web`, `billing-svc`
- Downstream: `identity-svc`, `ledger-svc`
