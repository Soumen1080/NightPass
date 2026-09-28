'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Clock, 
  Users, 
  Coins, 
  KeyRound,
  Lock,
  Flame
} from 'lucide-react';

export type TicketPassProps = {
  eventName: string;
  organizerAddress: string;
  contractAddress: string;
  entryFee?: number | string;
  maxGuests?: number | string;
  rsvpCount?: number | string;
  checkedInCount?: number | string;
  state?: string;
  commitmentHash?: string | null;
  secret?: Uint8Array | null;
  deadline?: string | null;
  isAttendee?: boolean;
  hasCheckedIn?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  className?: string;
};

export default function TicketPass({
  eventName,
  organizerAddress,
  contractAddress,
  entryFee = 0,
  maxGuests,
  rsvpCount,
  checkedInCount,
  state = 'NOT_STARTED',
  commitmentHash,
  deadline,
  isAttendee = false,
  hasCheckedIn = false,
  onAction,
  actionLabel,
  actionDisabled = false,
  className = '',
}: TicketPassProps) {
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedCommitment, setCopiedCommitment] = useState(false);

  const copyToClipboard = (text: string, type: 'contract' | 'commitment') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'contract') {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    } else {
      setCopiedCommitment(true);
      setTimeout(() => setCopiedCommitment(false), 2000);
    }
  };

  const getStatusBadge = () => {
    switch (state) {
      case 'STARTED':
        return (
          <span className="badge-glow-green animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Doors Open
          </span>
        );
      case 'DOORS_CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <Lock className="w-3 h-3" />
            Doors Closed
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="badge-glow-purple">
            <Sparkles className="w-3 h-3 text-purple-400" />
            RSVP Active
          </span>
        );
    }
  };

  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className={`ticket-pass p-6 sm:p-7 relative select-none ${className}`}>
      {/* Top Bar: VIP Header & Network Status */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xs uppercase tracking-widest text-zinc-300">
            Midnight VIP Pass
          </span>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Main Ticket Body */}
      <div className="pt-5 pb-2 relative z-10">
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight leading-tight line-clamp-1">
          {eventName || 'Untitled Midnight Event'}
        </h3>

        {/* Contract Address & Copy */}
        {contractAddress && (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyToClipboard(contractAddress, 'contract')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 hover:border-brand/40 text-[11px] font-mono text-zinc-300 transition-colors group"
              title="Click to copy contract address"
            >
              <span>{contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}</span>
              {copiedContract ? (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
              )}
            </button>
            <span className="text-[10px] text-zinc-500 font-mono">Contract ID</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 p-4 rounded-xl bg-black/35 border border-white/5 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mb-1 font-medium">
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              <span>Entry Fee</span>
            </div>
            <div className="font-display font-bold text-lg text-white">
              {entryFee} <span className="text-xs text-cyan-400 font-normal">Stars</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mb-1 font-medium">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>RSVPs</span>
            </div>
            <div className="font-display font-bold text-lg text-white">
              {rsvpCount ?? '—'}
              {maxGuests ? (
                <span className="text-xs text-zinc-500 font-normal">/{maxGuests}</span>
              ) : null}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mb-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Checked In</span>
            </div>
            <div className="font-display font-bold text-lg text-emerald-300">
              {checkedInCount ?? '0'}
            </div>
          </div>
        </div>

        {/* Deadline Indicator */}
        {formattedDeadline && (
          <div className="mt-3.5 flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>RSVP Deadline: <span className="text-zinc-200 font-medium">{formattedDeadline}</span></span>
          </div>
        )}

        {/* Commitment Hash Chip (for attendees who RSVP'd) */}
        {commitmentHash && (
          <div className="mt-4 p-3 rounded-lg bg-purple-950/30 border border-purple-500/25 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                <KeyRound className="w-3 h-3 text-purple-400" />
                ZK Commitment Stored
              </div>
              <p className="font-mono text-xs text-zinc-300 truncate mt-0.5">
                {commitmentHash}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(commitmentHash, 'commitment')}
              className="p-1.5 rounded bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 transition-colors shrink-0"
              title="Copy ZK Commitment Hash"
            >
              {copiedCommitment ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Perforated Stub Tear Line */}
      <div className="ticket-perforation relative z-10" />

      {/* Bottom Stub: Security & Actions */}
      <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
            <QrCode className="w-8 h-8 text-cyan-400 opacity-90" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Zero-Knowledge Verified
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Midnight Compact ZK Protocol
            </div>
          </div>
        </div>

        {onAction && actionLabel && (
          <button
            type="button"
            onClick={onAction}
            disabled={actionDisabled}
            className="w-full sm:w-auto btn-primary text-xs py-2.5 px-5 shrink-0"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
