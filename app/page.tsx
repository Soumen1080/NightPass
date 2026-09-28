'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  KeyRound, 
  Coins, 
  Users, 
  QrCode, 
  Flame, 
  EyeOff, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const TICKER_ITEMS = [
  'Zero-Knowledge Privacy', '✦', 
  'Off-Chain Secret Commitments', '✦', 
  'Anonymous Door Check-in', '✦', 
  'Midnight Preprod Network', '✦', 
  'ZK-SNARK Proof Circuits', '✦', 
  'Sybil-Resistant RSVPs', '✦',
  'Zero-Knowledge Privacy', '✦', 
  'Off-Chain Secret Commitments', '✦', 
  'Anonymous Door Check-in', '✦', 
  'Midnight Preprod Network', '✦', 
  'ZK-SNARK Proof Circuits', '✦', 
  'Sybil-Resistant RSVPs', '✦'
];

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col font-body bg-[#07050d] text-zinc-100 selection:bg-purple-500 selection:text-white">
      
      {/* ── Fixed Floating Navigation ─────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 sm:px-12 py-4 border-b border-white/10 bg-[#07050d]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <div className="w-full h-full rounded-[10px] bg-[#0c0717] flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="NightPass Logo" className="w-6 h-6 object-contain" />
              </div>
            </div>
            <span className="font-display text-xl font-black tracking-tight text-white">
              NightPass
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono text-zinc-300 border border-white/10 bg-black/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              Midnight Network
            </div>
            <Link 
              href="/app" 
              className="btn-primary py-2 px-5 text-sm shadow-[0_0_25px_rgba(168,85,247,0.4)]"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 sm:px-12 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-14 lg:gap-16">
        
        {/* Left Column: Vision & Actions */}
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 badge-glow-purple">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            Zero-Knowledge Event Protocol
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
            The Party That Stays <br />
            <span className="text-gradient-cyan">
              Completely Private
            </span>
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10">
            RSVPs secured by ZK-SNARKs. Your identity and wallet address stay 100% invisible on the public ledger until you step through the door and check in.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link 
              href="/app/organize" 
              className="btn-primary w-full sm:w-auto px-8 py-4 text-base shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            >
              <span>Organize an Event</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link 
              href="/app/join" 
              className="btn-secondary w-full sm:w-auto px-8 py-4 text-base"
            >
              <span>Join with Contract</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 text-left">
            <div>
              <div className="font-display text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">Off-Chain Privacy</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-cyan-400">0.0 sec</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">Ledger Leakage</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-purple-400">Midnight</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">ZK Native</div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Holographic Showcase */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none flex justify-center lg:justify-end z-10">
          <div className="relative w-full max-w-lg rounded-3xl p-2.5 bg-gradient-to-b from-purple-500/30 via-cyan-500/20 to-transparent border border-white/10 shadow-[0_20px_70px_rgba(168,85,247,0.25)] group">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative rounded-[22px] overflow-hidden bg-[#0c0717] border border-white/10 aspect-[16/10] sm:aspect-[16/11]">
              <img 
                src="/hero-pass.jpg" 
                alt="NightPass Holographic VIP Ticket" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07050d] via-transparent to-transparent opacity-80" />

              {/* Floating Live Badge */}
              <div className="absolute bottom-5 inset-x-5 p-4 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Midnight Zero-Knowledge Pass</h4>
                    <p className="text-[11px] text-zinc-400 font-mono">Proof-verified attendee commitment</p>
                  </div>
                </div>
                <span className="badge-glow-green text-[10px]">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee Ticker ─────────────────────────────────────────── */}
      <div className="w-full overflow-hidden py-4 border-y border-white/5 bg-black/40 relative z-10">
        <div className="marquee-track">
          {TICKER_ITEMS.map((item, idx) => (
            <span 
              key={idx} 
              className={`px-6 text-xs sm:text-sm font-semibold tracking-widest uppercase whitespace-nowrap ${
                item === '✦' ? 'text-purple-400' : 'text-zinc-400'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Interactive Comparison Section ─────────────────────────── */}
      <section className="py-28 px-6 sm:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <div className="badge-glow-cyan mb-4">Privacy Comparison</div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Why Standard Web3 Ticketing Is Broken
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
            On Ethereum or Solana, every ticket purchase doxxes the attendee. NightPass completely conceals your wallet until the physical event.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Public Web3 Card */}
          <div className="glass-panel p-8 border-rose-500/20 bg-rose-950/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-rose-200">Public Web3 Ticketing</h3>
                <p className="text-xs text-zinc-400">Traditional blockchains (Ethereum, Polygon, Solana)</p>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-zinc-300">
              <li className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Public Wallet Correlation:</strong> Anyone on Etherscan can see your address on the guest list months in advance.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Targeted Phishing:</strong> Hackers analyze attendees of high-value crypto summits to target high-net-worth wallets.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Upfront Financial Exposure:</strong> Entry fees must be paid in advance with traceable transactions.</span>
              </li>
            </ul>
          </div>

          {/* NightPass ZK Card */}
          <div className="glass-panel p-8 border-purple-500/40 bg-purple-950/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-bl-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">NightPass Zero-Knowledge</h3>
                <p className="text-xs text-cyan-400">Midnight Privacy Network</p>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-zinc-200 relative z-10">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero On-Chain Wallet Trace:</strong> RSVPs only record an anonymous cryptographic commitment. Nobody knows who holds it.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant Door Verification:</strong> Prove eligibility with a local client-side ZK proof without exposing past transaction history.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Pay at the Door:</strong> Entry fees are only transferred when the venue opens and you physically check in.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3-Step Protocol Architecture ───────────────────────────── */}
      <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <div className="badge-glow-purple mb-4">How It Works</div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Three Steps to Anonymous Events
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base">
            Engineered using Midnight Compact smart contracts to cleanly separate public event parameters from private attendee identities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: Sparkles,
              title: 'Organizer Deploys Contract',
              desc: 'The host specifies party size, entry fee in Stars, and RSVP deadline. A smart contract address is generated to share with invitees.',
              color: 'from-purple-500/20 to-purple-900/10',
              border: 'border-purple-500/30'
            },
            {
              step: '02',
              icon: Lock,
              title: 'Attendee Submits ZK RSVP',
              desc: 'Your browser derives a private cryptographic secret. Only the cryptographic commitment is posted on-chain. Your identity remains unseen.',
              color: 'from-cyan-500/20 to-cyan-900/10',
              border: 'border-cyan-500/30'
            },
            {
              step: '03',
              icon: QrCode,
              title: 'Check-In & Fee Settlement',
              desc: 'When the party starts, attendees unlock the door with their ZK proof. Entry fee is collected and attendance is securely finalized.',
              color: 'from-emerald-500/20 to-emerald-900/10',
              border: 'border-emerald-500/30'
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className={`glass-panel p-8 bg-gradient-to-b ${item.color} ${item.border} hover:scale-[1.02] transition-all`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-purple-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-display text-3xl font-extrabold text-zinc-600">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ Accordion ──────────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-12 max-w-4xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <div className="badge-glow-purple mb-4">Common Questions</div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'What is Midnight Network?',
              a: 'Midnight is a data protection blockchain that uses Zero-Knowledge proofs (ZKPs) to enable private smart contracts. It allows developers to build applications where sensitive data remains shielded while verifiable on-chain.'
            },
            {
              q: 'Can the organizer see my wallet address before check-in?',
              a: 'No. When you RSVP, your browser generates a random cryptographic secret and hashes it into a commitment. Only this commitment is visible on-chain. The organizer only sees the total count of RSVPs, not who holds them.'
            },
            {
              q: 'When do I pay the entry fee?',
              a: 'Unlike traditional ticketing where you pay upfront, in NightPass your entry fee in Stars (tDUST) is only submitted during the Check-In step when doors are open.'
            },
            {
              q: 'What wallet do I need to use NightPass?',
              a: 'NightPass connects directly to the Midnight 1AM Wallet browser extension on the Midnight Preprod network.'
            }
          ].map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-card border-white/10 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
              >
                <span className="font-display font-bold text-base text-white">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-6 pt-1 text-sm text-zinc-400 leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Call to Action Banner ──────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-12 max-w-5xl mx-auto w-full relative z-10">
        <div className="glass-panel p-10 sm:p-14 border-purple-500/40 text-center relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-[#0e091b] to-cyan-950/40 shadow-[0_0_60px_rgba(168,85,247,0.25)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          <h2 className="font-display text-3xl sm:text-5xl font-black text-white mb-6">
            Ready to Host a Truly Private Party?
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg max-w-xl mx-auto mb-8">
            Deploy your first Zero-Knowledge event contract in less than 30 seconds on Midnight.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/app/organize" 
              className="btn-primary py-4 px-8 text-base shadow-[0_0_30px_rgba(168,85,247,0.5)]"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/app" 
              className="btn-secondary py-4 px-8 text-base"
            >
              <span>Enter Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Luxury Footer ──────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-white/10 bg-[#050308] py-12 px-6 sm:px-12 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="font-display text-lg font-bold text-white">NightPass</span>
            <span className="text-xs text-zinc-500 font-mono ml-2">v0.1.0</span>
          </div>

          <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono">
            Powered by Midnight Compact ZK-SNARKs
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <Link href="/app" className="hover:text-purple-300 transition-colors">Portal</Link>
            <span>•</span>
            <Link href="/app/organize" className="hover:text-purple-300 transition-colors">Organize</Link>
            <span>•</span>
            <Link href="/app/join" className="hover:text-purple-300 transition-colors">Join</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
