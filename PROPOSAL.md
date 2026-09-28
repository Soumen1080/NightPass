# NightPass - Project Proposal

> **Status:** ✅ Level 5 Complete — 70 Preprod users onboarded, feedback loop documented, live at [night-pass-liart.vercel.app](https://night-pass-liart.vercel.app/)

## Project Overview

**NightPass** is a privacy-first party and event management decentralized application built on the Midnight Network. It solves the critical problem of public exposure in traditional event ticketing and RSVP systems by leveraging Zero-Knowledge (ZK) proofs and the unique privacy-preserving capabilities of the Midnight blockchain.

## The Problem

When users RSVP to events on traditional Web2 platforms or transparent Web3 blockchains, their attendance, identity, and personal connections are exposed. For private parties, exclusive corporate events, or discreet gatherings, this lack of privacy can lead to unwanted attention, data harvesting, or security concerns.

## The Solution

NightPass introduces a dual-state approach to event management:
- **Private RSVPs (Local State):** Attendees can RSVP and commit to attending an event without revealing their identity or wallet address on the public ledger. They use a locally generated secret to create a ZK proof.
- **Secure Check-In (Privacy Boundary):** When the attendee arrives at the event, they cross the privacy boundary by submitting their unshielded token entry fee and revealing their identity on-chain.

This model ensures that the guest list remains entirely hidden until the moment of physical check-in, protecting the privacy of attendees while giving the organizer verifiable cryptographic proof of headcount and collected fees.

## Key Features

1. **Zero-Knowledge RSVPs:** Add your commitment to a party's guest list using local ZK proving, keeping your identity private.
2. **Organizer Dashboard:** Easily deploy new event contracts with custom entry fees and maximum guest limits.
3. **Automated State Transitions:** The smart contract automatically progresses through states (`NOT_STARTED` -> `READY` -> `STARTED` -> `DOORS_CLOSED`) based on guest capacity and organizer actions.
4. **Fee Collection:** Secure, unshielded `tNIGHT` token transfers for entry fees, allowing organizers to easily claim collected funds after the event.
5. **Structured Feedback System:** In-app feedback modal with ratings, categories, and API endpoint — closing the user feedback loop.
6. **User Onboarding at Scale:** 70 verified Preprod users documented and on-chain.

## Technology Stack

- **Smart Contracts:** Midnight Compact Language
- **Frontend Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS v4
- **Wallet Integration:** 1AM Wallet for Midnight Network
- **Database:** Prisma ORM + Neon DB (PostgreSQL) / Supabase compatible
- **Deployment:** Vercel (Live: [night-pass-liart.vercel.app](https://night-pass-liart.vercel.app/))
- **CI/CD:** GitHub Actions

## Deployed Contract

**Midnight Preprod Contract Address:**
```
5ee45743bda79990b937f48e78594b4d5391cc4a15b27dc997d3591972ac6a24
```

## Level 5 Achievements

| Requirement | Evidence |
|---|---|
| 70 Preprod users | [USERS.md](USERS.md) |
| Feedback loop | [FEEDBACK.md](FEEDBACK.md) |
| Updated documentation | [README.md](README.md) |
| 30+ meaningful commits | See GitHub |
| Live demo | [night-pass-liart.vercel.app](https://night-pass-liart.vercel.app/) |

## Team

- **Soumen1080** (Developer)
