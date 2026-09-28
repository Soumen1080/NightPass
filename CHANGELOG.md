# Changelog

All notable changes to NightPass are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.5.0] — Level 5 Release

### Added
- **FEEDBACK.md** — Structured user feedback documentation with 70 Preprod tester responses
- **USERS.md** — Verified list of 70 Preprod user wallet addresses
- **CHANGELOG.md** — Version history tracking
- Demo video section in README
- "What You Will Learn" and Level 5 checklist section in README
- Supabase integration guide in `.env.example`
- Improved wallet connection retry logic
- ZK proof generation progress indicator
- Mobile responsiveness improvements

### Changed
- README updated with full Level 5 submission checklist
- Updated documentation to reflect Preprod user onboarding process

### Fixed
- Wallet detection on slow network connections
- Mobile layout overflow on join page

---

## [0.4.0] — Level 4 MVP Release

### Added
- Full `private-party.compact` Midnight Network smart contract
- Organizer Studio UI (deploy, start, close, claim fees)
- Guest Join UI (RSVP with ZK proof, check-in)
- 1AM Wallet integration via `WalletContext`
- Zero-Knowledge proof generation using `@midnight-ntwrk/compact-runtime`
- Holographic ticket preview component
- Transaction status card component
- Prisma ORM with Neon DB for off-chain metadata

### Changed
- Migrated to Next.js 15 App Router
- Switched to TailwindCSS v4

### Fixed
- Contract address prefill from environment variable
- WebSocket connection stability with `isomorphic-ws-fix.mjs`

---

## [0.3.0] — Infrastructure

### Added
- Dockerfile and docker-compose for containerized deployment
- GitHub Actions CI/CD pipelines (frontend, contract, full CI)
- Vercel deployment configuration

---

## [0.2.0] — Foundation

### Added
- Next.js project scaffold with TypeScript
- Midnight SDK packages integrated
- Base UI with dark theme

---

## [0.1.0] — Initial Commit

- Repository initialized
