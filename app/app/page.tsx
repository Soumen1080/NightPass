'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/lib/WalletContext';
import Link from 'next/link';
import { 
  Sparkles, 
  Crown, 
  Ticket, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldCheck, 
  Wallet, 
  Calendar, 
  AlertTriangle,
  Flame,
  KeyRound,
  ExternalLink
} from 'lucide-react';

export default function AppDashboard() {
  const { session, busy, error, connect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [hostedCount, setHostedCount] = useState<number | null>(null);
  const [rsvpCount, setRsvpCount] = useState<number | null>(null);

  const copyAddress = () => {
    if (!session?.unshieldedAddress) return;
    navigator.clipboard.writeText(session.unshieldedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!session) {
      setHostedCount(null);
      setRsvpCount(null);
      return;
    }

    const loadStats = async () => {
      try {
        const [partiesRes, rsvpsRes] = await Promise.all([
          fetch(`/api/parties?organizerAddress=${encodeURIComponent(session.unshieldedAddress)}`),
          fetch(`/api/rsvps?attendeeAddress=${encodeURIComponent(session.unshieldedAddress)}`)
        ]);

        if (partiesRes.ok) {
          const parties = await partiesRes.json();
          setHostedCount(Array.isArray(parties) ? parties.length : 0);
        }
        if (rsvpsRes.ok) {
          const rsvps = await rsvpsRes.json();
          setRsvpCount(Array.isArray(rsvps) ? rsvps.length : 0);
        }
      } catch (err) {
        console.error('Failed to load user stats', err);
      }
    };

    void loadStats();
  }, [session]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 w-full max-w-5xl mx-auto py-8">
      
      {!session ? (
        /* Disconnected State: Immersive Connect Portal */
        <div className="glass-panel w-full max-w-xl p-8 sm:p-12 text-center relative overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.25)] border-purple-500/30">
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-purple-600 rounded-full blur-[120px] opacity-25 pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-cyan-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />
          
          <div className="relative w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-brand to-cyan-400 p-[2px] shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <div className="w-full h-full rounded-[14px] bg-[#0c0717] flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-display font-black mb-3 text-white">
            Connect to NightPass
          </h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Link your Midnight 1AM Wallet to organize cryptographic private parties or secure your zero-knowledge event passes.
          </p>
          
          <button 
            type="button" 
            onClick={connect} 
            disabled={busy}
            className="btn-primary w-full py-4 text-base shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          >
            <Wallet className="w-5 h-5" />
            <span>{busy ? 'Connecting 1AM Wallet...' : 'Connect Midnight 1AM Wallet'}</span>
          </button>

          {/* Wallet Guide */}
          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-zinc-500 flex items-center justify-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              100% Client-Side ZK
            </span>
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-purple-400" />
              Preprod Network
            </span>
          </div>

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200 text-left flex items-start gap-3 backdrop-blur-md">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="break-all font-mono leading-relaxed">{error}</div>
            </div>
          )}
        </div>
      ) : (
        /* Connected State: High-Tech Dashboard */
        <div className="w-full space-y-10 fade-in">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Midnight Connected
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
                Control Hub
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                Manage your hosted events, check in guests, or access your tickets.
              </p>
            </div>

            {/* Address Chip */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={copyAddress}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-200 hover:bg-purple-900/40 transition-all shadow-lg shadow-purple-500/10 group"
              >
                <span>{session.unshieldedAddress.slice(0, 10)}...{session.unshieldedAddress.slice(-8)}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 border-purple-500/20 bg-purple-950/10">
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Hosted Parties</div>
              <div className="font-display text-3xl font-extrabold text-white mt-1">
                {hostedCount !== null ? hostedCount : '—'}
              </div>
              <div className="text-[11px] text-purple-300 mt-2 flex items-center gap-1">
                <Crown className="w-3 h-3 text-purple-400" />
                Organizer Contracts
              </div>
            </div>

            <div className="glass-card p-5 border-cyan-500/20 bg-cyan-950/10">
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">My Event Passes</div>
              <div className="font-display text-3xl font-extrabold text-white mt-1">
                {rsvpCount !== null ? rsvpCount : '—'}
              </div>
              <div className="text-[11px] text-cyan-300 mt-2 flex items-center gap-1">
                <Ticket className="w-3 h-3 text-cyan-400" />
                Active ZK Reservations
              </div>
            </div>

            <div className="glass-card p-5 border-emerald-500/20 bg-emerald-950/10">
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">ZK Privacy Level</div>
              <div className="font-display text-3xl font-extrabold text-emerald-400 mt-1">
                100%
              </div>
              <div className="text-[11px] text-emerald-300 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Full Shielded Commitments
              </div>
            </div>
          </div>

          {/* Main Action Hub: 2 High-Contrast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Action 1: Organize */}
            <Link 
              href="/app/organize" 
              className="glass-panel p-8 sm:p-9 border-purple-500/30 hover:border-purple-400/60 bg-gradient-to-b from-purple-950/30 to-black/50 transition-all hover:-translate-y-1.5 group relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/15 rounded-bl-full blur-3xl group-hover:bg-purple-500/25 transition-all" />
              
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-6 group-hover:scale-110 transition-transform">
                <Crown className="w-7 h-7" />
              </div>

              <div className="badge-glow-purple text-[10px] mb-3">Host &amp; Govern</div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-3">
                Organize an Event
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Deploy smart contracts to define attendee capacity, set entry fees, open doors for live check-in, and withdraw collected Stars.
              </p>

              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm uppercase tracking-wider group-hover:text-purple-200">
                <span>Manage Parties</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Action 2: Join */}
            <Link 
              href="/app/join" 
              className="glass-panel p-8 sm:p-9 border-cyan-500/30 hover:border-cyan-400/60 bg-gradient-to-b from-cyan-950/20 to-black/50 transition-all hover:-translate-y-1.5 group relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-400/10 rounded-bl-full blur-3xl group-hover:bg-cyan-400/20 transition-all" />
              
              <div className="w-14 h-14 rounded-2xl bg-cyan-900/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-6 group-hover:scale-110 transition-transform">
                <Ticket className="w-7 h-7" />
              </div>

              <div className="badge-glow-cyan text-[10px] mb-3">Attendee Vault</div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-3">
                Join Event &amp; Passes
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Paste an event address to RSVP anonymously with your ZK secret, view all your digital passes, and check in at the venue.
              </p>

              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm uppercase tracking-wider group-hover:text-cyan-200">
                <span>Access Passes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Privacy & Protocol Rules Card */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Protocol Architecture Safeguards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-purple-300 font-bold block mb-1">1. Anti-Self-RSVP</span>
                Organizers cannot RSVP to their own contract, guaranteeing fair community guest lists.
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-cyan-300 font-bold block mb-1">2. Zero Doxxing</span>
                Commitment hashes stored on Midnight do not reveal your wallet address to organizers.
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-emerald-300 font-bold block mb-1">3. Door Settlement</span>
                Entry fees in Stars are settled only during Check-In when the event doors have opened.
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
