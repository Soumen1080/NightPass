'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/WalletContext';
import {
  deployParty,
  startParty,
  closeEntry,
  claimFees,
  fetchPartyState,
  userAddressFromSession,
} from '@/lib/party';
import { generateSecret, loadSecret, saveSecret } from '@/lib/secret';
import TxCard, { TxLoadingCard, TxRecord } from '@/components/TxCard';
import TicketPass from '@/components/TicketPass';
import { 
  Crown, 
  Sparkles, 
  CalendarPlus, 
  ArrowLeft, 
  Copy, 
  Check, 
  Play, 
  DoorClosed, 
  Coins, 
  Users, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  Info,
  Wallet,
  AlertTriangle
} from 'lucide-react';

type PartyRecord = {
  id: string;
  contractAddress: string;
  name: string;
  description: string | null;
  entryFee: number;
  deadline: string | null;
  createdAt: string;
  _count?: { rsvps: number };
};

export default function OrganizePage() {
  const { session, busy: walletBusy, error: walletError, connect } = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [contractAddress, setContractAddress] = useState('');
  
  // Form State
  const [partyName, setPartyName] = useState('');
  const [partyDesc, setPartyDesc] = useState('');
  const [partySize, setPartySize] = useState('20');
  const [entryFee, setEntryFee] = useState('5');
  const [deadline, setDeadline] = useState('');

  // Live On-Chain State
  const [status, setStatus] = useState<Awaited<ReturnType<typeof fetchPartyState>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [deployingLabel, setDeployingLabel] = useState<string | null>(null);
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [myParties, setMyParties] = useState<PartyRecord[]>([]);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isBusy = walletBusy || busy;

  const refreshParties = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/parties?organizerAddress=${encodeURIComponent(session.unshieldedAddress)}`);
      if (res.ok) {
        const parties = await res.json();
        setMyParties(Array.isArray(parties) ? parties : []);
      }
    } catch (e) {
      console.error('Failed to fetch parties', e);
    }
  }, [session]);

  const refresh = useCallback(async () => {
    if (!contractAddress) return;
    setRefreshing(true);
    try {
      const indexerUri = session?.config?.indexerUri;
      setStatus(await fetchPartyState(indexerUri, contractAddress, { retries: 2, delayMs: 800 }));
    } catch (e) {
      console.error('Failed to fetch party state', e);
    } finally {
      setRefreshing(false);
    }
  }, [session, contractAddress]);

  useEffect(() => { void refreshParties(); }, [refreshParties]);
  useEffect(() => { void refresh(); }, [refresh]);

  const setQuickDeadline = (hours: number) => {
    const d = new Date(Date.now() + hours * 3600 * 1000);
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
    setDeadline(localISOTime);
  };

  async function guard(label: string, fn: () => Promise<{ contractAddress?: string } | void>) {
    setBusy(true);
    setDeployingLabel(label);
    const txId = Math.random().toString(36).substring(7);
    try {
      const result = await fn();
      await refresh();
      setTxHistory(prev => [{
        id: txId,
        type: label,
        status: 'success',
        timestamp: new Date(),
        contractAddress: (result as any)?.contractAddress || contractAddress,
      }, ...prev]);
    } catch (e) {
      setTxHistory(prev => [{ id: txId, type: label, status: 'error', error: String(e), timestamp: new Date() }, ...prev]);
    } finally {
      setBusy(false);
      setDeployingLabel(null);
    }
  }

  const onDeploy = () => guard('Deploy Party Contract', async () => {
    if (!session) {
      await connect();
      return;
    }
    const secret = generateSecret();
    const addr = await deployParty(session, Number(partySize), Number(entryFee), secret);
    
    await fetch('/api/parties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractAddress: addr,
        organizerAddress: session.unshieldedAddress,
        name: partyName || `Party ${addr.slice(0, 8)}`,
        description: partyDesc || null,
        entryFee: Number(entryFee),
        deadline: deadline || null,
      })
    });

    setContractAddress(addr);
    saveSecret('organizer', addr, secret);
    await refreshParties();
    setActiveTab('manage');
    return { contractAddress: addr };
  });

  const onStartParty = () => guard('Open Doors & Start Party', async () => {
    if (!session || !contractAddress) return;
    const secret = loadSecret('organizer', contractAddress);
    if (!secret) throw new Error('No organizer secret found for this contract in this browser');
    await startParty(session, contractAddress, secret);
  });

  const onCloseEntry = () => guard('Close Event Doors', async () => {
    if (!session || !contractAddress) return;
    const secret = loadSecret('organizer', contractAddress);
    if (!secret) throw new Error('No organizer secret found for this contract in this browser');
    await closeEntry(session, contractAddress, secret);
  });

  const onClaimFees = () => guard('Claim Collected Fees', async () => {
    if (!session || !contractAddress) return;
    const secret = loadSecret('organizer', contractAddress);
    if (!secret) throw new Error('No organizer secret found for this contract in this browser');
    await claimFees(session, contractAddress, userAddressFromSession(session), secret);
  });

  const copyContract = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const selectedParty = myParties.find(p => p.contractAddress === contractAddress);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 fade-in pb-24">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link 
            href="/app" 
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-purple-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white flex items-center gap-3">
            <span>Organizer Studio</span>
            <span className="badge-glow-purple text-[10px]">Host</span>
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md self-start sm:self-auto">
          <button
            type="button"
            onClick={() => { setActiveTab('create'); setContractAddress(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-lg shadow-purple-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'manage'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-lg shadow-purple-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>My Events ({myParties.length})</span>
          </button>
        </div>
      </div>

      {/* Disconnected Notification Banner */}
      {!session && (
        <div className="mb-8 space-y-3">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-cyan-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Wallet Not Connected</h3>
                <p className="text-xs text-zinc-400">Configure your event now and connect your 1AM wallet when ready to deploy.</p>
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
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-semibold text-rose-300">Wallet Connection Failed</p>
                <p className="mt-1 font-mono text-[11px] opacity-90">{walletError}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: CREATE EVENT WITH LIVE PASS PREVIEW ─────────────── */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Event Creator Form (7 cols) */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 border-purple-500/30 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="text-xl font-display font-bold text-white">Event Parameters</h2>
                <p className="text-xs text-zinc-400">Configure your smart contract rules before deploying</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Event Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Event Title <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. Midnight Cyberpunk Rave 2026"
                  className="glass-input text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Description / Venue Notes
                </label>
                <textarea
                  rows={2}
                  value={partyDesc}
                  onChange={(e) => setPartyDesc(e.target.value)}
                  placeholder="Private loft in downtown. Proof required for entry."
                  className="glass-input text-sm resize-none"
                />
              </div>

              {/* Guest Capacity & Entry Fee Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Max Guests</span>
                    <span className="text-purple-400 font-mono text-[11px]">{partySize} attendees</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={partySize}
                    onChange={(e) => setPartySize(e.target.value)}
                    className="glass-input text-sm font-mono"
                  />
                  <div className="flex gap-2 pt-1">
                    {['10', '25', '50', '100'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPartySize(val)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          partySize === val 
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' 
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Entry Fee (Stars)</span>
                    <span className="text-cyan-400 font-mono text-[11px]">{entryFee} Stars</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="glass-input text-sm font-mono"
                  />
                  <div className="flex gap-2 pt-1">
                    {['0', '5', '15', '50'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEntryFee(val)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          entryFee === val 
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200' 
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {val === '0' ? 'Free' : `${val}★`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                  <span>RSVP Deadline (Optional)</span>
                  <span className="text-zinc-500 text-[11px]">Enforced on-chain</span>
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="glass-input text-sm font-mono"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setQuickDeadline(24)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                  >
                    +24 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDeadline(72)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                  >
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDeadline(168)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                  >
                    +1 Week
                  </button>
                  {deadline && (
                    <button
                      type="button"
                      onClick={() => setDeadline('')}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={onDeploy}
                disabled={isBusy || !partyName}
                className="btn-primary w-full py-4 text-sm mt-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              >
                <Crown className="w-4 h-4" />
                <span>
                  {isBusy 
                    ? 'Deploying to Midnight...' 
                    : !session 
                    ? 'Connect Wallet to Deploy' 
                    : 'Deploy Smart Contract'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Holographic Ticket Pass Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Live Attendee Ticket Preview
              </span>
              <span className="badge-glow-purple text-[10px] py-0.5 px-2">Interactive</span>
            </div>

            <TicketPass
              eventName={partyName || 'My Midnight Event'}
              organizerAddress={session?.unshieldedAddress || 'Midnight Organizer'}
              contractAddress="midnight1mockaddresspreview9876543210"
              entryFee={entryFee || 0}
              maxGuests={partySize || 20}
              rsvpCount={0}
              checkedInCount={0}
              state="NOT_STARTED"
              deadline={deadline || null}
            />

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-zinc-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                When deployed, invitees will receive this exact holographic pass upon RSVPing. Their wallet addresses remain shielded.
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: MY HOSTED EVENTS & MISSION CONTROL ─────────────── */}
      {activeTab === 'manage' && (
        <div className="space-y-8">
          
          {!session ? (
            <div className="glass-panel p-12 text-center max-w-lg mx-auto border-purple-500/30 space-y-4">
              <Crown className="w-12 h-12 text-purple-400 mx-auto" />
              <h3 className="text-xl font-display font-bold text-white">Connect to View Hosted Events</h3>
              <p className="text-zinc-400 text-sm">
                Connect your Midnight 1AM Wallet to sync your deployed party contracts.
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
          ) : myParties.length === 0 ? (
            <div className="glass-panel p-12 text-center max-w-lg mx-auto border-white/10 space-y-4">
              <Crown className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-xl font-display font-bold text-white">No Hosted Events Yet</h3>
              <p className="text-zinc-400 text-sm">
                You haven&apos;t deployed any party contracts yet. Create your first event in seconds!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="btn-primary text-xs py-2.5 px-5"
              >
                Create Event Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Event Picker Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myParties.map((p) => {
                  const isSelected = p.contractAddress === contractAddress;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setContractAddress(p.contractAddress)}
                      className={`glass-panel p-5 cursor-pointer transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-purple-500/60 bg-purple-950/25 shadow-[0_0_30px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/40'
                          : 'hover:border-purple-500/30 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-display font-bold text-lg text-white truncate">
                          {p.name}
                        </h3>
                        <span className="badge-glow-purple text-[10px] py-0.5 px-2 shrink-0">
                          {p.entryFee} Stars
                        </span>
                      </div>

                      <p className="font-mono text-xs text-zinc-400 truncate mb-4">
                        {p.contractAddress}
                      </p>

                      <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5 text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          <span>{p._count?.rsvps || 0} RSVPs</span>
                        </span>

                        <span className="text-[11px] text-zinc-500 font-mono">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Event Mission Control Panel */}
              {contractAddress && (
                <div className="glass-panel p-6 sm:p-8 border-purple-500/40 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-bl-full blur-3xl pointer-events-none" />
                  
                  {/* Header & Status Refresh */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-display font-extrabold text-white">
                          {selectedParty?.name || 'Party Mission Control'}
                        </h2>
                        {status && (
                          <span className="badge-glow-purple text-[10px]">
                            {status.partyState.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">Live on-chain state and door entry management</p>
                    </div>

                    <button
                      type="button"
                      onClick={refresh}
                      disabled={refreshing}
                      className="btn-ghost text-xs py-2 px-3 self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                      <span>Refresh State</span>
                    </button>
                  </div>

                  {/* Shareable Contract Address */}
                  <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20 relative z-10">
                    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider block mb-2">
                      Shareable Party Contract Address (Give this to invitees)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={contractAddress}
                        className="glass-input font-mono text-xs text-purple-200"
                      />
                      <button
                        type="button"
                        onClick={() => copyContract(contractAddress)}
                        className="btn-primary text-xs py-2.5 px-4 shrink-0"
                      >
                        {copiedAddr ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedAddr ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Status Counters */}
                  {status && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                      <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                        <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          <span>RSVP Signups</span>
                        </div>
                        <div className="text-2xl font-display font-bold text-white">
                          {status.rsvpCount}
                          <span className="text-sm text-zinc-500 font-normal"> / {status.maxListSize}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                        <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1.5">
                          <DoorClosed className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Checked In</span>
                        </div>
                        <div className="text-2xl font-display font-bold text-emerald-300">
                          {status.checkedInCount}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                        <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Fee per Guest</span>
                        </div>
                        <div className="text-2xl font-display font-bold text-cyan-400">
                          {status.entryFee} <span className="text-xs text-zinc-500 font-normal">Stars</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Organizer Live Controls */}
                  <div className="space-y-3 pt-2 relative z-10">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Event Lifecycle Controls
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Start Party */}
                      <button
                        type="button"
                        onClick={onStartParty}
                        disabled={isBusy || (status?.partyState !== 'READY' && status?.partyState !== 'NOT_STARTED')}
                        className="btn-secondary py-3.5 px-4 text-xs flex-col gap-1 text-center disabled:opacity-40"
                      >
                        <Play className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold">Open Doors (Start Party)</span>
                        <span className="text-[10px] text-zinc-500">Allows attendees to check in</span>
                      </button>

                      {/* Close Doors */}
                      <button
                        type="button"
                        onClick={onCloseEntry}
                        disabled={isBusy || status?.partyState !== 'STARTED'}
                        className="btn-ghost py-3.5 px-4 text-xs flex-col gap-1 text-center disabled:opacity-40"
                      >
                        <DoorClosed className="w-4 h-4 text-zinc-300" />
                        <span className="font-bold">Close Doors</span>
                        <span className="text-[10px] text-zinc-500">Halts all new entries</span>
                      </button>

                      {/* Claim Fees */}
                      <button
                        type="button"
                        onClick={onClaimFees}
                        disabled={isBusy || status?.partyState !== 'DOORS_CLOSED' || status?.checkedInCount === 0}
                        className="btn-primary py-3.5 px-4 text-xs flex-col gap-1 text-center disabled:opacity-30"
                      >
                        <Coins className="w-4 h-4" />
                        <span className="font-bold">Claim Fees</span>
                        <span className="text-[10px] text-purple-200">
                          {status?.checkedInCount === 0 ? 'No guests to claim from' : 'Withdraw all collected Stars'}
                        </span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ── Transaction Loader & History Feed ─────────────────────── */}
      {deployingLabel && (
        <div className="mt-8">
          <TxLoadingCard label={deployingLabel} />
        </div>
      )}

      {txHistory.length > 0 && (
        <div className="mt-10 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Midnight Transaction Log
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
