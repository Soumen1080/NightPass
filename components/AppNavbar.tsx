'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';
import { 
  Sparkles, 
  Menu, 
  X, 
  Copy, 
  Check, 
  LogOut, 
  Radio, 
  CalendarPlus, 
  Ticket, 
  LayoutDashboard,
  Wallet
} from 'lucide-react';

export default function AppNavbar() {
  const pathname = usePathname();
  const { session, busy, connect, disconnect } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const navLinks = [
    { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/app/organize', label: 'Organize', icon: CalendarPlus },
    { href: '/app/join', label: 'Join Event', icon: Ticket },
  ];

  const copyAddress = () => {
    if (!session?.unshieldedAddress) return;
    navigator.clipboard.writeText(session.unshieldedAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const networkName = session?.config?.networkId || process.env.NEXT_PUBLIC_NETWORK_ID || 'preprod';

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 py-3.5 border-b border-white/10 bg-[#07050d]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all">
              <div className="w-full h-full rounded-[10px] bg-[#0c0717] flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="NightPass Logo" className="w-6 h-6 object-contain transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-extrabold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                NightPass
              </span>
              <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase -mt-0.5">
                ZK Event Protocol
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-500/15 text-purple-200 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action: Network & Wallet Controls */}
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-zinc-300 border border-white/10 bg-black/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="capitalize">{networkName}</span>
          </div>

          {/* Wallet State */}
          {session ? (
            <div className="flex items-center gap-2">
              {/* Address Chip with Copy */}
              <button
                type="button"
                onClick={copyAddress}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-200 hover:border-purple-400/50 hover:bg-purple-900/30 transition-all shadow-[0_0_12px_rgba(168,85,247,0.15)] group"
                title="Click to copy wallet address"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span>
                  {session.unshieldedAddress.slice(0, 6)}...{session.unshieldedAddress.slice(-4)}
                </span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-purple-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                )}
              </button>

              {/* Disconnect */}
              <button
                type="button"
                onClick={disconnect}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 bg-black/30 hover:bg-rose-950/30 transition-all"
                title="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={connect}
              disabled={busy}
              className="btn-primary text-xs py-2 px-4 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{busy ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white border border-white/10 bg-white/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-white/10 mt-3 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
