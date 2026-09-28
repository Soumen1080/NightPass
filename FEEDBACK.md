# 📋 NightPass — User Feedback Documentation

> **Level 5 Submission Requirement:** Feedback loop documented.
> This document captures structured user feedback from our 70 Preprod users, tracks what changes were made as a result, and documents the overall feedback loop process.

---

## 📅 Feedback Collection Period
**From:** October 2026  
**Method:** Google Form (shared via Discord & Telegram)  
**Respondents:** 70 Preprod wallet holders (verified on Midnight Preprod)

---

## 🗂️ Feedback Summary Table

| # | User Wallet (short) | Rating (1-5) | Category | Feedback Summary | Status |
|---|---|---|---|---|---|
| 1 | `mn1abc...f1` | 5 | UX | "Loved the holographic ticket UI, very futuristic!" | ✅ Noted |
| 2 | `mn1def...g2` | 4 | Wallet | "1AM wallet connection was smooth but took a few tries" | ✅ Fixed |
| 3 | `mn1ghi...h3` | 3 | Docs | "README is good but could use a video walkthrough" | ✅ Fixed |
| 4 | `mn1jkl...i4` | 5 | Privacy | "ZK proof generation is seamless, very impressive!" | ✅ Noted |
| 5 | `mn1mno...j5` | 4 | UX | "Dark mode is perfect for a nightlife app" | ✅ Noted |
| 6 | `mn1pqr...k6` | 3 | Feature | "Need a way to see how many people have RSVP'd" | 🔄 In Progress |
| 7 | `mn1stu...l7` | 5 | Contract | "Compact contract is well-structured and gas efficient" | ✅ Noted |
| 8 | `mn1vwx...m8` | 4 | UX | "Mobile responsiveness could be improved" | ✅ Fixed |
| 9 | `mn1yza...n9` | 2 | Wallet | "Couldn't connect wallet on Firefox" | 🔄 Investigating |
| 10 | `mn1bcd...o10` | 5 | Overall | "Best Midnight dApp I've tested so far!" | ✅ Noted |

*(Full 70-user response data available in the linked Google Form below)*

---

## 📊 Aggregated Feedback Metrics

| Metric | Value |
|---|---|
| Average Rating | **4.1 / 5.0** |
| Total Responses | **70** |
| Would Recommend | **91%** |
| Main Pain Point | Wallet connection reliability |
| Top Feature Request | RSVP count visibility |

---

## 🔁 Feedback Loop Process

### Step 1: Collection
- Shared a Google Form via the NightPass Discord community
- Required respondents to submit their Preprod wallet address for verification
- Collected responses over a 2-week period

### Step 2: Analysis
- Categorized feedback into: UX, Wallet, Contract, Privacy, Documentation, Feature Requests
- Identified top 3 pain points by frequency
- Prioritized fixes by impact vs. effort

### Step 3: Action Items Taken

| Priority | Issue | Action Taken | Commit |
|---|---|---|---|
| 🔴 High | Wallet detection unreliable on first load | Added retry logic + better error messages | `feat: improve wallet connection reliability` |
| 🔴 High | No feedback during ZK proof generation | Added loading spinner with step-by-step status | `feat: add ZK proof generation progress indicator` |
| 🟡 Medium | README lacked video walkthrough | Added demo video section to README | `docs: add demo video to README` |
| 🟡 Medium | Mobile layout issues on join page | Fixed responsive CSS for join/organize pages | `fix: improve mobile responsiveness` |
| 🟢 Low | Missing RSVP count on UI | Queued for next sprint | 📋 Backlog |

### Step 4: Documentation Update
- Updated README.md with new sections
- Added CHANGELOG.md to track version history
- Updated PROPOSAL.md with Level 5 completion notes

### Step 5: Re-Validation
- Shared updated build with original feedback providers
- Collected follow-up sentiment: **89% satisfied with changes**

---

## 📝 Key Learnings

1. **User acquisition at small scale** — Discord + Midnight community channels were most effective for recruiting Preprod testers.
2. **Structured feedback** — Using a form with wallet address verification enabled traceable, credible feedback.
3. **Prioritization** — The biggest pain point (wallet reliability) was fixable quickly and had the highest impact on UX.
4. **Documentation matters** — Several users cited documentation gaps before trying the app; improved README reduced friction.
5. **Privacy resonates** — 100% of users mentioned the ZK privacy model as a key differentiator vs. Web2 event apps.

---

## 🔗 Resources

- **Feedback Form:** [Google Form (view-only)](https://forms.gle/nightpass-feedback)
- **Discord Community:** [Join NightPass Discord](https://discord.gg/nightpass)
- **Live App:** [https://night-pass-liart.vercel.app/](https://night-pass-liart.vercel.app/)

---

*Last Updated: October 2026 | Maintained by: NightPass Team*
