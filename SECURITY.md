# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 0.5.x (Level 5) | ✅ |
| 0.4.x (Level 4) | ✅ |
| < 0.4.0 | ❌ |

## Reporting a Vulnerability

If you discover a security vulnerability in NightPass, please **do NOT open a public issue**.

Instead, report it privately via one of these channels:

1. **GitHub Security Advisory:** [Report a vulnerability](https://github.com/Soumen1080/NightPass/security/advisories/new)
2. **Email:** Contact the maintainer via their GitHub profile

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### Response Timeline

| Step | Timeline |
|---|---|
| Acknowledgment | Within 48 hours |
| Initial Assessment | Within 1 week |
| Fix / Patch | Within 2 weeks |
| Public Disclosure | After fix is deployed |

## Smart Contract Security

The NightPass Compact smart contract (`private-party.compact`) handles:
- Zero-Knowledge proof generation and verification
- User commitment storage (`hashedPartyGoers`)
- Entry fee collection and disbursement

If you find a bug in the contract logic that could allow:
- Unauthorized RSVPs (bypassing guest list)
- Fee theft
- Incorrect ZK proof verification

Please report it immediately as a **Critical** vulnerability.

---

*Security is foundational to NightPass — we take all reports seriously.*
