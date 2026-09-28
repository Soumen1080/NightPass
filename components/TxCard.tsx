'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Loader2, 
  Copy, 
  Check, 
  Cpu,
  ShieldAlert
} from 'lucide-react';

export type TxRecord = {
  id: string;
  type: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  timestamp: Date;
  contractAddress?: string;
};

/** High-tech animated ZK proving loading card */
export function TxLoadingCard({ label }: { label: string }) {
  return (
    <div className="glass-panel p-6 border-purple-500/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-bl-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="relative w-11 h-11 shrink-0 mt-0.5">
          <div className="absolute inset-0 rounded-2xl bg-purple-500/20 border border-purple-500/40 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm uppercase tracking-wider text-purple-300">
              {label} in progress
            </span>
            <span className="badge-glow-purple text-[10px] py-0.5 px-2">
              ZK Proving
            </span>
          </div>

          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Constructing zero-knowledge circuit witness and awaiting 1AM Wallet signature on Midnight Network…
          </p>

          {/* Animated Glowing Progress Bar */}
          <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand via-cyan-400 to-pink-500"
              style={{
                width: '100%',
                animation: 'progressShimmer 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TxCard({ tx, network }: { tx: TxRecord; network: string }) {
  const [copied, setCopied] = useState(false);
  const isError = tx.status === 'error';
  const isSuccess = tx.status === 'success';

  const explorerBase =
    network === 'preview'
      ? 'https://explorer.preview.midnight.network'
      : network === 'preprod'
      ? 'https://explorer.preprod.midnight.network'
      : null;

  const explorerUrl = explorerBase
    ? tx.contractAddress
      ? `${explorerBase}/contracts/${tx.contractAddress}`
      : explorerBase
    : null;

  const copyContract = () => {
    if (!tx.contractAddress) return;
    navigator.clipboard.writeText(tx.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`glass-card p-4 sm:p-5 flex items-start gap-4 border transition-all ${
        isError
          ? 'border-rose-500/30 bg-rose-950/20'
          : 'border-emerald-500/30 bg-emerald-950/15'
      }`}
    >
      {/* Icon Badge */}
      <div
        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
          isError
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}
      >
        {isError ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <CheckCircle2 className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm font-bold uppercase tracking-wider font-display ${
                isError ? 'text-rose-200' : 'text-emerald-200'
              }`}
            >
              {tx.type}
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isError
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {isError ? 'Failed' : 'Success'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 shrink-0">
            {tx.timestamp.toLocaleTimeString()}
          </span>
        </div>

        {/* Contract Address preview if available */}
        {tx.contractAddress && isSuccess && (
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-400">Contract Address:</span>
            <button
              type="button"
              onClick={copyContract}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 hover:border-brand/40 text-[11px] font-mono text-purple-300 transition-colors"
            >
              <span>{tx.contractAddress.slice(0, 10)}...{tx.contractAddress.slice(-8)}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
            </button>
          </div>
        )}

        {/* Explorer Link */}
        {explorerUrl && isSuccess && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            <span>View on Midnight Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* Error Details */}
        {isError && tx.error && (
          <div className="mt-3 p-3 rounded-lg bg-black/50 border border-rose-500/20 text-xs font-mono text-rose-300 leading-relaxed break-words">
            {tx.error}
          </div>
        )}
      </div>
    </div>
  );
}
