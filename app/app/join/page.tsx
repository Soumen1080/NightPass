'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/WalletContext';
import {
  rsvp,
  checkIn,
  fetchPartyState,
  userAddressFromSession,
} from '@/lib/party';
import { generateSecret, loadSecret, saveSecret } from '@/lib/secret';
import TxCard, { TxLoadingCard, TxRecord } from '@/components/TxCard';
import TicketPass from '@/components/TicketPass';
import { 
  Ticket, 
  Sparkles, 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  RefreshCw, 
  QrCode, 
  Check, 
  Coins, 
  Clock,
  DoorOpen,
  Info,
  Wallet,
  Compass
} from 'lucide-react';

type RsvpRecord = {
  id: string;
  partyId: string;
  commitmentHash: string;
  attendeeAddress: string;
  createdAt: string;
  party: {
    contractAddress: string;
    name: string;
    entryFee: number;
    deadline: string | null;
  };
};

type PublicParty = {
  id: string;
  contractAddress: string;
  name: string;
  description: string | null;
  entryFee: number;
  deadline: string | null;
  createdAt: string;
  _count?: { rsvps: number };
};

export default function JoinPage() {
  const { session, busy: walletBusy, error: walletError, connect } = useWallet();
  const [activeTab, setActiveTab] = useState<'join' | 'tickets'>('join');
  const [contractAddress, setContractAddress] = useState(
    () => process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim() || ''
  );
  const [status, setStatus] = useState<Awaited<ReturnType<typeof fetchPartyState>> | null>(null);
  const [partyDetails, setPartyDetails] = useState<any | null>(null);
  
  const [busy, setBusy] = useState(false);
  const [actionLabel, setActionLabel] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [myRsvps, setMyRsvps] = useState<RsvpRecord[]>([]);
  const [publicParties, setPublicParties] = useState<PublicParty[]>([]);
  const [hasRsvpdLocal, setHasRsvpdLocal] = useState(false);

  const isBusy = walletBusy || busy;
  const isDeadlinePassed = partyDetails?.deadline ? new Date() > new Date(partyDetails.deadline) : false;

  // Check localStorage for RSVP status safely in browser
  useEffect(() => {
    if (contractAddress && typeof window !== 'undefined') {
      setHasRsvpdLocal(!!loadSecret('attendee', contractAddress));
    } else {
      setHasRsvpdLocal(false);
    }
  }, [contractAddress]);

  const hasRsvpdDb = myRsvps.some(r => r.party?.contractAddress === contractAddress);
  const hasRsvpd = hasRsvpdDb || hasRsvpdLocal;

  // Load public parties for exploration
  useEffect(() => {
    const loadPublicParties = async () => {
      try {
        const res = await fetch('/api/parties');
        if (res.ok) {
          const list = await res.json();
          setPublicParties(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error('Failed to load public parties', e);
      }
    };
    void loadPublicParties();
  }, []);

  const refreshRsvps = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/rsvps?attendeeAddress=${encodeURIComponent(session.unshieldedAddress)}`);
      if (res.ok) {
        const data = await res.json();
        setMyRsvps(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch RSVPs', e);
    }
  }, [session]);

  const refresh = useCallback(async () => {
    if (!contractAddress) {
      setStatus(null);
      setPartyDetails(null);
      setFetchError(false);
      return;
    }
    setFetchError(false);
    setIsFetching(true);
    try {
      const indexerUri = session?.config?.indexerUri;
      // Fetch on-chain state with fast fallback
      const state = await fetchPartyState(indexerUri, contractAddress, { retries: 2, delayMs: 800 });
      setStatus(state);
      
      const dbRes = await fetch(`/api/parties?contractAddress=${encodeURIComponent(contractAddress)}`);
      if (dbRes.ok) {
        const data = await dbRes.json();
        setPartyDetails(data ?? null);
      } else {
        setPartyDetails(null);
      }
    } catch (e) {
      console.warn('Contract lookup failed:', e);
      setStatus(null);
      setPartyDetails(null);
      setFetchError(true);
    } finally {
      setIsFetching(false);
    }
  }, [session, contractAddress]);

  useEffect(() => { void refreshRsvps(); }, [refreshRsvps]);
  useEffect(() => { void refresh(); }, [refresh]);

  async function guard(label: string, fn: () => Promise<{ contractAddress?: string; txHash?: string } | string | void>) {
    setBusy(true);
    setActionLabel(label);
    const txId = Math.random().toString(36).substring(7);
    try {
      const result = await fn();
      await refresh();
      const addr = typeof result === 'object' ? result?.contractAddress : contractAddress;
      const txHash = typeof result === 'object' ? result?.txHash : typeof result === 'string' ? result : undefined;
      setTxHistory(prev => [{
        id: txId,
        type: label,
        status: 'success',
        timestamp: new Date(),
        contractAddress: addr || contractAddress,
        txHash,
      }, ...prev]);
    } catch (e) {
      setTxHistory(prev => [{ id: txId, type: label, status: 'error', error: String(e), timestamp: new Date() }, ...prev]);
    } finally {
      setBusy(false);
      setActionLabel(null);
    }
  }

  const onRsvp = () => guard('Zero-Knowledge RSVP', async () => {
    if (!session) {
      await connect();
      return;
    }
    if (!contractAddress) return;
    let secret = loadSecret('attendee', contractAddress);
    if (!secret) {
      secret = generateSecret();
      saveSecret('attendee', contractAddress, secret);
    }
    
    const txHash = await rsvp(session, contractAddress, userAddressFromSession(session), secret);
    setHasRsvpdLocal(true);

    if (partyDetails?.id) {
      const commitHash = '0x' + Array.from(secret.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join('');
      try {
        await fetch('/api/rsvps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partyId: partyDetails.id,
            commitmentHash: commitHash,
            attendeeAddress: session.unshieldedAddress,
          })
        });
        await refreshRsvps();
      } catch (dbErr) {
        console.warn('Failed to record RSVP in database:', dbErr);
      }
    }
    return { contractAddress, txHash };
  });

  const onCheckIn = () => guard('Door Check-In & Fee Settlement', async () => {
    if (!session) {
      await connect();
      return;
    }
    if (!contractAddress) return;
    const secret = loadSecret('attendee', contractAddress);
    if (!secret) throw new Error('RSVP first — no attendee secret found for this contract');
    const txHash = await checkIn(session, contractAddress, userAddressFromSession(session), secret);
    return { contractAddress, txHash };
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 fade-in pb-24">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link 
            href="/app" 
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-cyan-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white flex items-center gap-3">
            <span>Attendee Vault</span>
            <span className="badge-glow-cyan text-[10px]">Passes</span>
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'join'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Explore &amp; Join</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tickets'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My VIP Passes ({myRsvps.length})</span>
          </button>
        </div>
      </div>

      {/* Wallet Connection Helper Banner if Disconnected */}
      {!session && (
        <div className="mb-8 space-y-3">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Wallet Not Connected</h3>
                <p className="text-xs text-zinc-400">Connect your Midnight 1AM Wallet to generate your cryptographic proof and RSVP.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={connect}
              disabled={isBusy}
              className="btn-primary text-xs py-2.5 px-5 shrink-0"
            >
              {walletBusy ? 'Connecting...' : 'Connect 1AM Wallet'}
            </button>
          </div>

          {walletError && (
            <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-4 text-xs text-rose-200 flex items-start gap-3 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-semibold text-rose-300">Wallet Connection Failed</p>
                <p className="mt-1 font-mono text-[11px] opacity-90">{walletError}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: JOIN WITH CONTRACT ADDRESS ───────────────────────── */}
      {activeTab === 'join' && (
        <div className="space-y-8">
          
          {/* Search / Paste Input Panel */}
          <div className="glass-panel p-6 sm:p-8 border-cyan-500/30 space-y-4">
            <div className="flex items-center gap-2.5 pb-2">
              <Search className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-lg font-display font-bold text-white">Enter Event Contract Address</h2>
                <p className="text-xs text-zinc-400">Paste the Midnight smart contract address or pick a featured event below</p>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value.trim())}
                placeholder="Paste contract address (e.g. 0200abcd...)"
                className="glass-input pl-4 pr-24 py-4 font-mono text-xs sm:text-sm text-cyan-200"
              />
              {contractAddress && (
                <button
                  type="button"
                  onClick={() => setContractAddress('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-zinc-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Helper: Public Events or User RSVPs */}
            {publicParties.length > 0 && !contractAddress && (
              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  Featured Events on Midnight
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {publicParties.slice(0, 6).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setContractAddress(p.contractAddress)}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/40 text-left transition-all hover:-translate-y-0.5 group"
                    >
                      <div className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                        {p.contractAddress}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 border-t border-white/5 pt-1.5">
                        <span>{p.entryFee} Stars</span>
                        <span>{p._count?.rsvps || 0} RSVPs</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {isFetching && (
            <div className="glass-panel p-8 text-center border-cyan-500/30 space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-sm font-bold text-white">Querying Midnight Indexer</div>
              <p className="text-xs text-zinc-400">Fetching on-chain contract state and zero-knowledge circuit rules…</p>
            </div>
          )}

          {/* Error Banner */}
          {!isFetching && fetchError && contractAddress && (
            <div className="glass-panel p-8 text-center border-rose-500/40 bg-rose-950/15 space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <div className="text-base font-bold text-rose-200">Contract Not Found on Midnight Network</div>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No active event contract matches this address. Please verify that the organizer deployed to the same network.
              </p>
              <button
                type="button"
                onClick={refresh}
                className="btn-ghost text-xs py-2 px-4 text-purple-300 hover:text-white"
              >
                Retry Query
              </button>
            </div>
          )}

          {/* Found Event Snapshot & Action Station */}
          {status && contractAddress && !isFetching && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: Live VIP Ticket Pass (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Verified Event Ticket
                  </span>
                  <span className="badge-glow-green text-[10px]">On-Chain Active</span>
                </div>

                <TicketPass
                  eventName={partyDetails?.name || `Midnight Event`}
                  organizerAddress="Midnight Organizer"
                  contractAddress={contractAddress}
                  entryFee={status.entryFee}
                  maxGuests={status.maxListSize}
                  rsvpCount={status.rsvpCount}
                  checkedInCount={status.checkedInCount}
                  state={status.partyState}
                  deadline={partyDetails?.deadline}
                />
              </div>

              {/* Right Side: Attendee Actions Station (5 cols) */}
              <div className="lg:col-span-5 glass-panel p-6 sm:p-7 border-cyan-500/40 space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <KeyRound className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">Attendee Actions</h3>
                    <p className="text-xs text-zinc-400">Zero-knowledge proof verification steps</p>
                  </div>
                </div>

                {/* RSVP Status Check */}
                <div className="space-y-4">
                  
                  {/* Step 1: RSVP */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    hasRsvpd 
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200' 
                      : 'bg-black/30 border-white/10'
                  }`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 font-display font-bold text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          hasRsvpd ? 'bg-emerald-400 text-black' : 'bg-white/10 text-white'
                        }`}>
                          {hasRsvpd ? '✓' : '1'}
                        </span>
                        <span>Zero-Knowledge RSVP</span>
                      </div>
                      {hasRsvpd && (
                        <span className="badge-glow-green text-[10px] py-0.5 px-2">
                          Confirmed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      {hasRsvpd 
                        ? 'Your cryptographic commitment is registered on Midnight. Your secret is stored in this browser.'
                        : 'Register your intent to attend anonymously. No wallet identity is revealed.'}
                    </p>

                    <button
                      type="button"
                      onClick={onRsvp}
                      disabled={isBusy || (hasRsvpd ? false : (status.partyState !== 'NOT_STARTED' || isDeadlinePassed))}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                        hasRsvpd
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                          : 'btn-primary'
                      }`}
                    >
                      {hasRsvpd 
                        ? '✓ Spot Secured Anonymously' 
                        : !session
                        ? 'Connect Wallet to RSVP'
                        : isDeadlinePassed 
                        ? 'RSVP Deadline Passed' 
                        : status.partyState !== 'NOT_STARTED'
                        ? 'RSVP Closed (Party Started)'
                        : 'Submit ZK RSVP'}
                    </button>
                  </div>

                  {/* Step 2: Door Check-In */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    status.partyState === 'STARTED' && hasRsvpd
                      ? 'bg-cyan-950/25 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                      : 'bg-black/20 border-white/5 opacity-60'
                  }`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 font-display font-bold text-sm text-white">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">
                          2
                        </span>
                        <span>Door Check-In &amp; Entry Fee</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {status.entryFee} Stars
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      When the organizer opens the venue doors, submit your ZK witness to verify your pass and settle the entry fee.
                    </p>

                    <button
                      type="button"
                      onClick={onCheckIn}
                      disabled={isBusy || status.partyState !== 'STARTED' || !hasRsvpd}
                      className="btn-secondary w-full py-3 px-4 text-xs font-bold disabled:opacity-40"
                    >
                      <DoorOpen className="w-4 h-4" />
                      <span>
                        {status.partyState === 'NOT_STARTED'
                          ? 'Doors Not Open Yet'
                          : !hasRsvpd
                          ? 'Must RSVP First'
                          : !session
                          ? 'Connect Wallet to Check In'
                          : `Check In (${status.entryFee} Stars)`}
                      </span>
                    </button>
                  </div>

                </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-zinc-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    Your ZK proof reveals eligibility without exposing past wallet transaction logs.
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ── TAB 2: MY DIGITAL VIP PASSES ───────────────────────────── */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {!session ? (
            <div className="glass-panel p-12 text-center max-w-lg mx-auto border-cyan-500/30 space-y-4">
              <Ticket className="w-12 h-12 text-cyan-400 mx-auto" />
              <h3 className="text-xl font-display font-bold text-white">Connect to View Your Passes</h3>
              <p className="text-zinc-400 text-sm">
                Connect your Midnight 1AM Wallet to sync and view your held event tickets.
              </p>
              <button
                type="button"
                onClick={connect}
                disabled={isBusy}
                className="btn-primary text-xs py-2.5 px-5"
              >
                {walletBusy ? 'Connecting...' : 'Connect 1AM Wallet'}
              </button>
            </div>
          ) : myRsvps.length === 0 ? (
            <div className="glass-panel p-12 text-center max-w-lg mx-auto border-white/10 space-y-4">
              <Ticket className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-xl font-display font-bold text-white">No VIP Passes Held</h3>
              <p className="text-zinc-400 text-sm">
                You haven&apos;t RSVP&apos;d to any events yet. Paste an event address to secure your first private ticket!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('join')}
                className="btn-secondary text-xs py-2.5 px-5"
              >
                Explore Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {myRsvps.map((rsvpItem) => (
                <div key={rsvpItem.id} className="space-y-2">
                  <TicketPass
                    eventName={rsvpItem.party.name}
                    organizerAddress="Midnight Host"
                    contractAddress={rsvpItem.party.contractAddress}
                    entryFee={rsvpItem.party.entryFee}
                    commitmentHash={rsvpItem.commitmentHash}
                    deadline={rsvpItem.party.deadline}
                    isAttendee={true}
                    onAction={() => {
                      setContractAddress(rsvpItem.party.contractAddress);
                      setActiveTab('join');
                    }}
                    actionLabel="View Status & Check In →"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Transaction Loader & History Feed ─────────────────────── */}
      {actionLabel && (
        <div className="mt-8">
          <TxLoadingCard label={actionLabel} />
        </div>
      )}

      {txHistory.length > 0 && (
        <div className="mt-10 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Attendee Transaction Log
            </h3>
            <button
              type="button"
              onClick={() => setTxHistory([])}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear
            </button>
          </div>
          {txHistory.map((tx) => (
            <TxCard key={tx.id} tx={tx} network={session?.config?.networkId || 'preprod'} />
          ))}
        </div>
      )}

    </div>
  );
}
