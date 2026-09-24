'use client';

import { useWallet } from '@/lib/WalletContext';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  rsvp,
  checkIn,
  fetchPartyState,
  userAddressFromSession,
} from '@/lib/party';
import { generateSecret, loadSecret, saveSecret } from '@/lib/secret';
import TxCard, { TxRecord } from '@/components/TxCard';

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

export default function JoinPage() {
  const { session, busy: walletBusy } = useWallet();
  const [contractAddress, setContractAddress] = useState('');
  const [status, setStatus] = useState<Awaited<ReturnType<typeof fetchPartyState>> | null>(null);
  const [partyDetails, setPartyDetails] = useState<any | null>(null);
  
  const [busy, setBusy] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [myRsvps, setMyRsvps] = useState<RsvpRecord[]>([]);

  const isBusy = walletBusy || busy;
  const isDeadlinePassed = partyDetails?.deadline ? new Date() > new Date(partyDetails.deadline) : false;
  
  // Check if they already RSVP'd either via DB or local storage
  const hasRsvpdDb = myRsvps.some(r => r.party?.contractAddress === contractAddress);
  const hasRsvpdLocal = !!loadSecret('attendee', contractAddress);
  const hasRsvpd = hasRsvpdDb || hasRsvpdLocal;

  const refreshRsvps = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/rsvps?attendeeAddress=${session.unshieldedAddress}`);
      if (res.ok) setMyRsvps(await res.json());
    } catch (e) {
      console.error('Failed to fetch RSVPs', e);
    }
  }, [session]);

  const refresh = useCallback(async () => {
    if (!session || !contractAddress) {
      setStatus(null);
      setPartyDetails(null);
      setFetchError(false);
      return;
    }
    setFetchError(false);
    setIsFetching(true);
    try {
      const state = await fetchPartyState(session.config.indexerUri, contractAddress);
      setStatus(state);
      
      const dbRes = await fetch(`/api/parties?contractAddress=${contractAddress}`);
      if (dbRes.ok) setPartyDetails(await dbRes.json());
      else setPartyDetails(null);
    } catch (e) {
      console.error(e);
      setStatus(null);
      setPartyDetails(null);
      setFetchError(true);
    } finally {
      setIsFetching(false);
    }
  }, [session, contractAddress]);

  useEffect(() => { void refreshRsvps(); }, [refreshRsvps]);
  useEffect(() => { void refresh(); }, [refresh]);

  async function guard(label: string, fn: () => Promise<{ contractAddress?: string } | void>) {
    setBusy(true);
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
    }
  }

  const onRsvp = () => guard('RSVP', async () => {
    if (!session || !contractAddress) return;
    let secret = loadSecret('attendee', contractAddress);
    if (!secret) {
      secret = generateSecret();
      saveSecret('attendee', contractAddress, secret);
    }
    
    const fakeCommitHash = "0x" + Math.random().toString(16).slice(2);
    await rsvp(session, contractAddress, userAddressFromSession(session), secret);
    
    if (partyDetails?.id) {
      await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: partyDetails.id,
          commitmentHash: fakeCommitHash,
          attendeeAddress: session.unshieldedAddress,
        })
      });
      await refreshRsvps();
    }
  });

  const onCheckIn = () => guard('Check In', async () => {
    if (!session || !contractAddress) return;
    const secret = loadSecret('attendee', contractAddress);
    if (!secret) throw new Error('RSVP first — no attendee secret found for this contract');
    await checkIn(session, contractAddress, userAddressFromSession(session), secret);
  });

  if (!session) {
    return (
      <div className="w-full text-center mt-20">
        <p className="text-zinc-500 mb-4">You need to connect your wallet first.</p>
        <Link href="/app" className="text-brand hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 fade-in pb-20">
      <Link href="/app" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6">
        <span>←</span> Back to Main Menu
      </Link>

      <div className="glass-card w-full p-6 sm:p-10 relative overflow-hidden shadow-2xl border-t border-cyan-400/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-bl-full blur-[50px] pointer-events-none"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-900/30 flex items-center justify-center text-2xl text-cyan-400">🎟️</div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Joiner Dashboard</h1>
            <p className="text-sm text-zinc-400">Securely RSVP and check in at the door</p>
          </div>
        </div>

        {!contractAddress ? (
          <div className="space-y-8 relative z-10">
            {myRsvps.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-200">My RSVPs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myRsvps.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setContractAddress(r.party.contractAddress)}
                      className="text-left bg-black/40 border border-white/5 hover:border-cyan-400/50 p-4 rounded-xl transition-all hover:-translate-y-1 group"
                    >
                      <h4 className="font-bold text-white text-lg mb-1 truncate">{r.party.name}</h4>
                      <p className="text-xs text-zinc-400 font-mono mb-3 truncate">{r.party.contractAddress}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                        <div className="text-xs">
                          <span className="text-zinc-500">Fee: </span>
                          <span className="text-cyan-400 font-bold">{r.party.entryFee} Stars</span>
                        </div>
                      </div>
                      {r.party.deadline && (
                        <div className="text-[10px] text-zinc-500 mt-2">
                          Deadline: {new Date(r.party.deadline).toLocaleString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-4 border-t border-white/10">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest ml-1">Join New Party</label>
              <div className="relative">
                <input value={contractAddress} onChange={(e) => setContractAddress(e.target.value.trim())}
                  placeholder="Paste the contract address you got from the organizer..."
                  className="glass-input w-full rounded-xl px-5 py-4 text-zinc-100 placeholder:text-zinc-600 focus:ring-1 focus:ring-cyan-400 font-mono text-sm" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 relative z-10">
            <div className="flex items-center justify-between">
              <button onClick={() => setContractAddress('')} className="text-sm text-zinc-400 hover:text-white transition-colors">
                ← Back to My RSVPs
              </button>
              <h3 className="text-lg font-bold text-white">
                {partyDetails?.name || 'Party Details'}
              </h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest ml-1">Party Address</label>
              <div className="relative">
                <input readOnly value={contractAddress}
                  className="glass-input w-full rounded-xl px-5 py-4 text-zinc-300 font-mono text-sm" />
              </div>
            </div>

            {isFetching && !status && (
              <div className="bg-black/20 border border-brand/20 p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 min-h-[120px]">
                <div className="w-6 h-6 rounded-full border-2 border-brand/20 border-t-brand animate-spin" />
                <span className="text-zinc-400 text-sm animate-pulse">Searching Midnight Indexer...</span>
              </div>
            )}

            {!isFetching && fetchError && contractAddress && (
              <div className="bg-danger/10 border border-danger/30 p-6 rounded-2xl flex flex-col items-center justify-center space-y-2 min-h-[120px]">
                <span className="text-danger-200 font-bold text-sm">Contract Not Found</span>
                <span className="text-zinc-400 text-xs text-center">We couldn't find this contract on the network. Please check the address and try again.</span>
              </div>
            )}

            {status && (
              <div className="bg-gradient-to-br from-black/40 to-black/10 border border-brand/20 p-6 rounded-2xl space-y-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand to-cyan-400"></div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-zinc-400 text-sm font-medium">Live Status</span>
                  <div className="flex items-center gap-3">
                    {partyDetails?.deadline && (
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${isDeadlinePassed ? 'text-red-400' : 'text-zinc-400'}`}>
                        {isDeadlinePassed ? 'Deadline Passed' : `Ends: ${new Date(partyDetails.deadline).toLocaleString()}`}
                      </span>
                    )}
                    <span className="px-4 py-1.5 rounded-full bg-brand/10 text-brand-hover text-xs font-bold uppercase tracking-widest border border-brand/20">
                      {status.partyState.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center divide-x divide-white/5">
                  <div className="pl-0">
                    <div className="text-3xl font-light text-zinc-100">{status.rsvpCount}<span className="text-zinc-600 text-base">/{status.maxListSize}</span></div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 uppercase font-semibold mt-2">RSVPs</div>
                  </div>
                  <div>
                    <div className="text-3xl font-light text-zinc-100">{status.checkedInCount}</div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 uppercase font-semibold mt-2">Checked In</div>
                  </div>
                  <div>
                    <div className="text-3xl font-light text-cyan-400">{status.entryFee}</div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 uppercase font-semibold mt-2">Fee (Stars)</div>
                  </div>
                </div>
              </div>
            )}

            {contractAddress && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="relative group">
                  <button type="button" onClick={onRsvp} disabled={isBusy || status?.partyState !== 'NOT_STARTED' || isDeadlinePassed || hasRsvpd}
                    className={`w-full glow-button rounded-xl px-4 py-5 font-bold tracking-wide border disabled:opacity-50 text-lg transition-all ${
                      hasRsvpd 
                        ? 'bg-success/20 border-success/40 text-success-200 cursor-default'
                        : 'bg-brand/30 hover:bg-brand/50 border-brand/40 text-purple-200'
                    }`}>
                    {hasRsvpd ? '✅ Going' : isDeadlinePassed ? 'RSVP Closed' : 'RSVP Now'}
                  </button>
                  {isDeadlinePassed && !hasRsvpd && (
                    <div className="absolute -bottom-10 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <span className="bg-black/80 text-red-400 text-xs px-3 py-1.5 rounded-md border border-red-900/30 whitespace-nowrap">
                        The RSVP deadline has passed
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative group">
                  <button type="button" onClick={onCheckIn} disabled={isBusy || status?.partyState !== 'STARTED' || !hasRsvpd}
                    className="glow-button w-full rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 px-4 py-5 font-bold tracking-wide border border-cyan-400/40 disabled:opacity-30 text-lg transition-all text-cyan-200">
                    Check In
                  </button>
                  <div className="absolute -bottom-10 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="bg-black/80 text-cyan-200 text-xs px-3 py-1.5 rounded-md border border-cyan-400/30 whitespace-nowrap">
                      Pays {status?.entryFee ?? '?'} Stars & reveals identity
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {txHistory.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Transaction Log</h3>
            <button type="button" onClick={() => setTxHistory([])} className="text-[10px] text-zinc-700 hover:text-zinc-500 transition-colors">Clear</button>
          </div>
          {txHistory.map(tx => (
            <TxCard key={tx.id} tx={tx} network={session.config.networkId} />
          ))}
        </div>
      )}
    </div>
  );
}
