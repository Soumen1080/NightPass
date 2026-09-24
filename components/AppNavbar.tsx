'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';

export default function AppNavbar() {
  const pathname = usePathname();
  const { session, busy, connect, disconnect } = useWallet();

  const navLinks = [
    { href: '/app', label: 'Dashboard' },
    { href: '/app/organize', label: 'Organize' },
    { href: '/app/join', label: 'Join Event' },
  ];

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/5"
      style={{
        background: 'linear-gradient(to bottom, rgba(16,8,24,0.95), rgba(16,8,24,0.85))',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
          <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-brand-hover transition-colors">
            NightPass
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1.5 ml-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand/20 text-brand-hover border border-brand/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-zinc-400 border border-white/10 bg-black/40">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
          Midnight Network
        </div>

        {session ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-xs font-mono text-brand-hover">
              <span className="w-2 h-2 rounded-full bg-success inline-block" />
              <span>
                {session.unshieldedAddress.slice(0, 6)}...{session.unshieldedAddress.slice(-4)}
              </span>
            </div>
            <button
              type="button"
              onClick={disconnect}
              className="px-3 py-1.5 rounded-full text-xs text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 bg-black/30 transition-colors"
              title="Disconnect Wallet"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={connect}
            disabled={busy}
            className="glow-button px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] bg-gradient-to-r from-brand to-brand-dark transition-all disabled:opacity-50"
          >
            {busy ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  );
}
