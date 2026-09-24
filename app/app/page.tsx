'use client';

import { useWallet } from '@/lib/WalletContext';
import Link from 'next/link';

export default function AppDashboard() {
  const { session, busy, error, connect } = useWallet();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-4xl mx-auto">
      
      {!session ? (
        <div className="glass-card w-full max-w-lg p-10 text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-display font-bold mb-4 text-white">Access the Portal</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">Connect your Midnight 1AM Wallet to start organizing or joining zero-knowledge events.</p>
          
          <button type="button" onClick={connect} disabled={busy}
            className="glow-button w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark px-10 py-5 text-lg font-bold shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 text-white">
            {busy ? 'Connecting...' : 'Connect 1AM Wallet'}
          </button>

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-danger/50 bg-[#3a1414]/80 backdrop-blur-md p-4 text-sm text-red-200 text-left flex items-start gap-3">
              <svg className="w-5 h-5 text-danger shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="break-all font-mono text-xs mt-0.5">{error}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full fade-in">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-full border border-white/10 shadow-inner mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              <span className="font-mono text-sm text-zinc-300">
                Connected: {session.unshieldedAddress.slice(0, 12)}...{session.unshieldedAddress.slice(-8)}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">Welcome to NightPass</h1>
            <p className="text-zinc-400 text-lg">What would you like to do today?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
            {/* Organizer Option */}
            <Link href="/app/organize" className="group glass-card p-8 border border-white/10 hover:border-brand/50 transition-all hover:-translate-y-1 block relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                👑
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Organize a Party</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Deploy a new Zero-Knowledge contract, manage RSVPs, check guests in at the door, and collect entry fees.
              </p>
              <div className="text-brand font-semibold text-sm uppercase tracking-widest flex items-center gap-2">
                Get Started 
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>

            {/* Attendee Option */}
            <Link href="/app/join" className="group glass-card p-8 border border-white/10 hover:border-cyan-400/50 transition-all hover:-translate-y-1 block relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-900/30 text-cyan-400 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🎟️
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Join a Party</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                RSVP securely with your ZK proofs to keep your identity hidden until you check in at the venue.
              </p>
              <div className="text-cyan-400 font-semibold text-sm uppercase tracking-widest flex items-center gap-2">
                Join Now
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          </div>
          
          <div className="mt-12 p-6 rounded-2xl bg-black/40 border border-white/5 text-center max-w-3xl mx-auto">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-3">General Rules</h3>
            <ul className="text-xs text-zinc-500 space-y-2 inline-block text-left">
              <li className="flex items-center gap-2"><span className="text-brand">✦</span> Organizers cannot RSVP to their own party on this platform.</li>
              <li className="flex items-center gap-2"><span className="text-brand">✦</span> Your RSVP remains totally anonymous on the ledger until Check-In.</li>
              <li className="flex items-center gap-2"><span className="text-brand">✦</span> Entry fees are only paid at the door during Check-In, not during RSVP.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
