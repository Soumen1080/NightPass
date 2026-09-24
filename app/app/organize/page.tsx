'use client';

import { useWallet } from '@/lib/WalletContext';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
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
  const { session, busy: walletBusy } = useWallet();
  const [contractAddress, setContractAddress] = useState('');
  
  const [partyName, setPartyName] = useState('');
  const [partyDesc, setPartyDesc] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [entryFee, setEntryFee] = useState('5');
  const [deadline, setDeadline] = useState('');

  const [status, setStatus] = useState<Awaited<ReturnType<typeof fetchPartyState>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [deployingLabel, setDeployingLabel] = useState<string | null>(null);
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [myParties, setMyParties] = useState<PartyRecord[]>([]);

  const isBusy = walletBusy || busy;

  const refreshParties = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/parties?organizerAddress=${session.unshieldedAddress}`);
      if (res.ok) setMyParties(await res.json());
    } catch (e) {
      console.error('Failed to fetch parties', e);
    }
  }, [session]);

  const refresh = useCallback(async () => {
    if (!session || !contractAddress) return;
    try {
      setStatus(await fetchPartyState(session.config.indexerUri, contractAddress));
    } catch (e) {
      console.error(e);
    }
  }, [session, contractAddress]);

  useEffect(() => { void refreshParties(); }, [refreshParties]);
  useEffect(() => { void refresh(); }, [refresh]);

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

  const onDeploy = () => guard('Deploy Party', async () => {
    if (!session) throw new Error('Wallet not connected');
    const secret = generateSecret();
    const addr = await deployParty(session, Number(partySize), Number(entryFee), secret);
    
    await fetch('/api/parties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractAddress: addr,
        organizerAddress: session.unshieldedAddress,
        name: partyName || `Party ${addr.slice(0, 8)}`,
        description: partyDesc,
        entryFee,
        deadline,
      })
    });

    setContractAddress(addr);
    saveSecret('organizer', addr, secret);
    await refreshParties();
    return { contractAddress: addr };
  });

  const onStartParty = () => guard('Start Party', async () => {
    if (!session || !contractAddress) return;
    const secret = loadSecret('organizer', contractAddress);
    if (!secret) throw new Error('No organizer secret found for this contract in this browser');
    await startParty(session, contractAddress, secret);
  });

  const onCloseEntry = () => guard('Close Doors', async () => {
    if (!session || !contractAddress) return;
    const secret = loadSecret('organizer', contractAddress);
    if (!secret) throw new Error('No organizer secret found for this contract in this browser');
    await closeEntry(session, contractAddress, secret);
  });

  const onClaimFees = () => guard('Claim Fees', async () => {
    if (!session || !contractAddress) return;
    const secret = loadSecret('organizer', contractAddress);
    if (!secret) throw new Error('No organizer secret found for this contract in this browser');
    await claimFees(session, contractAddress, userAddressFromSession(session), secret);
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

      <div className="glass-card w-full p-6 sm:p-10 relative overflow-hidden shadow-2xl border-t border-brand/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-bl-full blur-[50px] pointer-events-none"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center text-2xl">👑</div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Organizer Dashboard</h1>
            <p className="text-sm text-zinc-400">Deploy and manage your private events</p>
          </div>
        </div>

        {!contractAddress ? (
          <div className="space-y-8 relative z-10">
            {myParties.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-200">My Hosted Parties</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myParties.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setContractAddress(p.contractAddress)}
                      className="text-left bg-black/40 border border-white/5 hover:border-brand/50 p-4 rounded-xl transition-all hover:-translate-y-1 group"
                    >
                      <h4 className="font-bold text-white text-lg mb-1 truncate">{p.name}</h4>
                      <p className="text-xs text-zinc-400 font-mono mb-3 truncate">{p.contractAddress}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                        <div className="text-xs">
                          <span className="text-zinc-500">RSVPs: </span>
                          <span className="text-zinc-300 font-bold">{p._count?.rsvps || 0}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-zinc-500">Fee: </span>
                          <span className="text-cyan-400 font-bold">{p.entryFee}</span>
                        </div>
                      </div>
                      {p.deadline && (
                        <div className="text-[10px] text-zinc-500 mt-2">
                          Deadline: {new Date(p.deadline).toLocaleString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6 bg-black/20 p-8 rounded-2xl border border-white/5 relative z-10">
              <h3 className="text-lg font-medium text-zinc-200">Create New Party</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs text-zinc-400 font-semibold uppercase tracking-widest ml-1">Party Name</label>
                  <input value={partyName} onChange={(e) => setPartyName(e.target.value)} type="text" placeholder="e.g. Secret Midnight Rave"
                    className="glass-input w-full rounded-xl px-4 py-3 text-zinc-100" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs text-zinc-400 font-semibold uppercase tracking-widest ml-1">Description (Optional)</label>
                  <input value={partyDesc} onChange={(e) => setPartyDesc(e.target.value)} type="text"
                    className="glass-input w-full rounded-xl px-4 py-3 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-semibold uppercase tracking-widest ml-1">Max Guests</label>
                  <input value={partySize} onChange={(e) => setPartySize(e.target.value)} type="number" min="1"
                    className="glass-input w-full rounded-xl px-4 py-3 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-semibold uppercase tracking-widest ml-1">Entry Fee (Stars)</label>
                  <input value={entryFee} onChange={(e) => setEntryFee(e.target.value)} type="number" min="1"
                    className="glass-input w-full rounded-xl px-4 py-3 text-zinc-100" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs text-zinc-400 font-semibold uppercase tracking-widest ml-1">RSVP Deadline</label>
                  <input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="datetime-local"
                    className="glass-input w-full rounded-xl px-4 py-3 text-zinc-100" />
                </div>
              </div>
              <button type="button" onClick={onDeploy} disabled={isBusy || !partyName}
                className="glow-button w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark px-4 py-4 font-bold tracking-wide hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 mt-2 text-white">
                {isBusy ? 'Deploying to network...' : 'Deploy Party Contract'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 relative z-10">
            
            <div className="flex items-center justify-between">
              <button onClick={() => setContractAddress('')} className="text-sm text-zinc-400 hover:text-white transition-colors">
                ← Back to Parties
              </button>
              <h3 className="text-lg font-bold text-white">
                {myParties.find(p => p.contractAddress === contractAddress)?.name || 'Manage Party'}
              </h3>
            </div>

            {/* Contract Info */}
            <div className="p-4 border border-brand/20 bg-brand/5 rounded-xl">
              <label className="text-xs font-semibold text-brand uppercase tracking-widest block mb-2">Your Party Address (Share this!)</label>
              <div className="flex items-center gap-3">
                <input readOnly value={contractAddress} className="glass-input w-full rounded-lg px-4 py-3 font-mono text-xs text-zinc-300" />
                <button onClick={() => navigator.clipboard.writeText(contractAddress)} className="px-4 py-3 bg-brand/20 hover:bg-brand/30 rounded-lg text-brand font-medium text-sm transition-colors whitespace-nowrap">
                  Copy
                </button>
              </div>
            </div>

            {/* Live Status Panel */}
            {status && (
              <div className="bg-gradient-to-br from-black/40 to-black/10 border border-brand/20 p-6 rounded-2xl space-y-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand to-cyan-400"></div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-zinc-400 text-sm font-medium">Live Status</span>
                  <span className="px-4 py-1.5 rounded-full bg-brand/10 text-brand-hover text-xs font-bold uppercase tracking-widest border border-brand/20">
                    {status.partyState.replace(/_/g, ' ')}
                  </span>
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

            {/* Organizer Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button type="button" onClick={onStartParty} disabled={isBusy || (status?.partyState !== 'READY' && status?.partyState !== 'NOT_STARTED')}
                className="glow-button rounded-xl bg-cyan-600/40 hover:bg-cyan-600/60 px-4 py-4 font-medium border border-cyan-400/30 disabled:opacity-50 transition-all text-cyan-100 disabled:bg-cyan-900/40 disabled:text-cyan-400/50 disabled:border-cyan-800/30">
                Start Party
              </button>
              <button type="button" onClick={onCloseEntry} disabled={isBusy || status?.partyState !== 'STARTED'}
                className="glow-button rounded-xl bg-white/10 hover:bg-white/20 px-4 py-4 font-medium border border-white/20 disabled:opacity-50 transition-all text-zinc-100 disabled:bg-white/5 disabled:text-zinc-500 disabled:border-white/5">
                Close Doors
              </button>
              <div className="relative group">
                <button type="button" onClick={onClaimFees} disabled={isBusy || status?.partyState !== 'DOORS_CLOSED' || status?.checkedInCount === 0}
                  className="glow-button w-full rounded-xl bg-purple-600/20 hover:bg-purple-600/40 px-4 py-5 font-bold tracking-wide border border-purple-400/40 disabled:opacity-30 text-lg transition-all text-purple-200">
                  Claim Fees
                </button>
                <div className="absolute -bottom-10 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="bg-black/80 text-purple-200 text-xs px-3 py-1.5 rounded-md border border-purple-400/30 whitespace-nowrap">
                    {status?.checkedInCount === 0 ? 'No guests checked in to claim fees from' : 'Withdraw all collected Stars'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {deployingLabel && (
        <div className="mt-6">
          <TxLoadingCard label={deployingLabel} />
        </div>
      )}

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
