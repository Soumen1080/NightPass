# NightPass - Project Proposal

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

## Technology Stack

- **Smart Contracts:** Midnight Compact Language
- **Frontend Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **Wallet Integration:** 1AM Wallet for Midnight Network

## Team

- **Debansh001** (Developer)
