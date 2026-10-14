# SEC-POL-001: Enterprise Authentication & Cryptographic Standards

- **Policy ID**: `POL-001`
- **Owner**: Security & Compliance Team
- **Effective Date**: 2026-01-01
- **Status**: Active Policy

## 1. Scope
Applies to all microservices communicating within Nexora Cloud virtual private clouds.

## 2. Policy Mandates
1. Shared secrets in transit or static symmetric signing keys are prohibited for Tier-1 services.
2. Any service handling PCI-DSS or monetary transactions (including `payments-svc` and `ledger-svc`) must use asymmetric ephemeral cryptographic credentials approved by the Security Review Board.
