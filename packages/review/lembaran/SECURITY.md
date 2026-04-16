# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Lembaran seriously. As a zero-knowledge encryption tool handling sensitive credentials, we appreciate responsible disclosure of any vulnerabilities.

### How to Report

**Email:** agen.salva@gmail.com  
**Expected Response Time:** Within 48 hours  
**Preferred Language:** English or Indonesian

### What to Include

When reporting a security vulnerability, please include:

1. **Description** - Clear explanation of the vulnerability
2. **Steps to Reproduce** - Detailed reproduction steps
3. **Impact Assessment** - What could an attacker achieve?
4. **Proof of Concept** - Code, screenshots, or logs (if available)
5. **Your Contact Info** - How we can reach you for follow-up

### What to Expect

- **Acknowledgment** - We'll confirm receipt within 48 hours
- **Initial Assessment** - Within 7 days, we'll provide an initial assessment
- **Updates** - We'll keep you informed of our progress
- **Credit** - We'll credit you in our changelog (unless you prefer anonymity)

### Scope

We're particularly interested in reports related to:

- **Cryptographic weaknesses** in AES-GCM or Argon2id implementation
- **Key management flaws** - Master key exposure, weak key derivation
- **Memory leaks** - Sensitive data not properly scrubbed from memory
- **Side-channel attacks** - Timing attacks, cache attacks
- **Authentication bypass** - Vault unlocking without proper credentials
- **Data exposure** - Unencrypted data in logs, error messages, or temp files

### Out of Scope

- Issues in dependencies (unless directly exploitable)
- Social engineering attacks
- Physical access attacks (evil maid, hardware tampering)
- Attacks requiring already-compromised systems

### Bug Bounty

At this time, we do not offer monetary bug bounties. We will provide:

- Public acknowledgment and credit
- Link to your security research page/profile
- Invitation to our security advisory team (for significant findings)

---

**Last Updated:** April 2026  
**Contact:** agen.salva@gmail.com
